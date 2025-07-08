import { AudioFile } from '@/controllers/transcribe.controller';
import { SpeechToTextService } from './speechToText.service';
import { LlamaService } from './llama.service';
import { PromptsService } from './prompts/prompts.service';
import { instructions } from './prompts/instructions';
import { AgentService } from './agent.service';
import { SocketIOService } from './socketio.service';
import { Message } from '@/types/types';
import { ConversationsService } from './conversations.service';
import { UUID } from 'crypto';
import { KnowledgeService } from './knowledge.service';
import { User } from '@/types/db.types';
import { FirecrawlService } from './firecrawl.service';

export class AssistantOrchestratorService {
  private speechToTextService = new SpeechToTextService();
  private llamaService = new LlamaService();
  private agentService = new AgentService();
  private promptsService = new PromptsService();
  private socketIOService = SocketIOService.getInstance();
  private conversationsService = new ConversationsService();
  private knowledgeService = new KnowledgeService();
  private firecrawlService = new FirecrawlService();

  private async prependKnowledgeContext(prompt: string, userId?: number) {
    const knowledgeContext = await this.knowledgeService.getUserKnowledgeContext(userId);

    if (!knowledgeContext) return prompt;

    return `### USER KNOWLEDGE CONTEXT ###\n"""\n${knowledgeContext}\n"""\n\n${prompt}`;
  }

  private extractUrlsFromText(text: string): string[] {
    const urlRegex =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
    const matches = text.match(urlRegex);
    return matches ? [...new Set(matches)] : []; // Remove duplicates
  }

  private async getScreenshotsWithFallback(
    urls: string[],
    maxScreenshots: number = 2
  ): Promise<{ originalUrl: string; screenshotUrl: string }[]> {
    const screenshotsWithUrls: { originalUrl: string; screenshotUrl: string }[] = [];

    for (const url of urls) {
      if (screenshotsWithUrls.length >= maxScreenshots) break;

      try {
        const screenshot = await this.firecrawlService.getScreenshotFromUrl(url);
        if (screenshot) {
          screenshotsWithUrls.push({
            originalUrl: url,
            screenshotUrl: screenshot,
          });
        }
      } catch (error) {
        console.warn(`Failed to get screenshot for URL: ${url}`, error);
        // Continue to next URL
      }
    }

    return screenshotsWithUrls;
  }

  getTextFromInput = (input: { text?: string; audioFile?: AudioFile }) => {
    if (input.audioFile) return this.speechToTextService.transcribeAudio(input.audioFile);
    if (input.text) return input.text;
    throw new Error('No valid input provided. Please provide either text or an audio file.');
  };

  verifyQueryBeforeSendingToAgent = async (userQuery: string, userId?: number) => {
    let prompt = this.promptsService.getPromptToVerifyQueryBeforeSendingToAgent(userQuery);

    prompt = await this.prependKnowledgeContext(prompt, userId);

    const llamaInstructions = instructions.llamaBaseInstructions;
    const llamaResponse = await this.llamaService.promptLlama({
      instructions: llamaInstructions,
      prompt,
    });

    return {
      isCorrect: llamaResponse.toLowerCase().includes('true'),
      response: llamaResponse,
    };
  };

  processNewMessage = async ({
    conversationHistory,
    newMessage,
    conversationId,
    user,
  }: {
    conversationHistory: Message[];
    newMessage: string;
    conversationId?: string;
    user?: User;
  }) => {
    try {
      if (conversationId) {
        await this.conversationsService.conversationInsert(
          newMessage,
          conversationId as UUID,
          'user'
        );

        console.log(`📤 Sending progress to room ${conversationId}: 'Processing your request...'`);
        this.socketIOService.sendProgress(conversationId, 'Processing your request...');
      }

      let prompt = this.promptsService.getPromptToTransformNewMessageToAgentPrompt(
        conversationHistory,
        newMessage
      );

      // Prepend knowledge context if available
      prompt = await this.prependKnowledgeContext(prompt, user?.id);

      console.debug('initial prompt', prompt);

      const llamaInstructions = instructions.llamaBaseInstructions;

      if (conversationId) {
        console.log(`📤 Sending progress to room ${conversationId}: 'Analyzing your query...'`);
        this.socketIOService.sendProgress(conversationId, 'Analyzing your query...');
      }

      const llamaResponse = await this.llamaService.promptLlama({
        instructions: llamaInstructions,
        prompt,
      });

      console.debug('llamaResponse', llamaResponse);

      if (conversationId) {
        console.log(
          `📤 Sending progress to room ${conversationId}: 'The agent is researching the best options for you...'`
        );
        this.socketIOService.sendProgress(
          conversationId,
          'The agent is researching the best options for you...'
        );
      }

      const agentResponse = await this.agentService.researchTravel(llamaResponse, conversationId);

      if (conversationId) {
        console.log(
          `📤 Sending progress to room ${conversationId}: 'Preparing your personalized response...'`
        );
        this.socketIOService.sendProgress(
          conversationId,
          'The agent is researching the best options for you...'
        );
      }

      const promptToTransformAgentResponseToReadable =
        this.promptsService.getPromptToTransformNewMessageToReadable(
          agentResponse.response,
          newMessage,
          conversationHistory
        );

      const readableResponse = await this.llamaService.promptLlama({
        instructions: llamaInstructions,
        prompt: promptToTransformAgentResponseToReadable,
      });

      if (conversationId) {
        this.socketIOService.sendProgress(
          conversationId,
          'Getting some images for you... Almost done.'
        );
      }

      const urlsFromResponse = this.extractUrlsFromText(readableResponse);
      const screenshotsWithUrls = await this.getScreenshotsWithFallback(urlsFromResponse, 2);

      console.log('screenshotsWithUrls', screenshotsWithUrls);

      if (conversationId) {
        await this.conversationsService.conversationInsert(
          readableResponse,
          conversationId as UUID,
          'assistant',
          screenshotsWithUrls
        );
      }

      if (conversationId) {
        console.log(`📤 Sending final response to room ${conversationId}`);
        this.socketIOService.sendFinalResponse({
          conversationId,
          message: readableResponse,
          screenshotsWithUrls,
          isAskingForMoreInformation: false,
        });
      }

      return {
        readableResponse,
        screenshotsWithUrls,
      };
    } catch (error) {
      console.error('Error in processNewMessage', error);

      if (conversationId) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        this.socketIOService.sendToRoom(conversationId, 'agent-error', {
          error: errorMessage,
          timestamp: new Date(),
        });
      }

      return {
        readableResponse: '',
        screenshotsWithUrls: [],
      };
    }
  };

  processRequest = async (
    userQuery: string,
    conversationId: string,
    message?: string,
    user?: User
  ) => {
    try {
      if (!userQuery) {
        throw new Error('No valid input provided. Please provide either text or an audio file.');
      }

      if (conversationId && message) {
        const knowledgeResult = await this.knowledgeService.evaluateMessage(message);

        if (knowledgeResult.isRelevant && user) {
          await this.knowledgeService.knowledgeInsert(knowledgeResult, user.id);
        }

        await this.conversationsService.conversationInsert(message, conversationId as UUID, 'user');

        console.log(`📤 Sending progress to room ${conversationId}: 'Processing your request...'`);
        this.socketIOService.sendProgress(conversationId, 'Processing your request...');
      }

      const isQueryCorrect = await this.verifyQueryBeforeSendingToAgent(userQuery, user?.id);

      if (!isQueryCorrect.isCorrect) {
        if (conversationId) {
          await this.conversationsService.conversationInsert(
            isQueryCorrect.response,
            conversationId as UUID,
            'assistant'
          );

          this.socketIOService.sendFinalResponse({
            conversationId,
            message: isQueryCorrect.response,
            screenshotsWithUrls: [],
            isAskingForMoreInformation: true,
          });
          return;
        }
      }

      const prompt = this.promptsService.getPromptToTransformUserQueryToAgentPrompt(userQuery);

      const llamaInstructions = instructions.llamaBaseInstructions;

      if (conversationId) {
        console.log(`📤 Sending progress to room ${conversationId}: 'Analyzing your query...'`);
        this.socketIOService.sendProgress(conversationId, 'Analyzing your query...');
      }

      const llamaPrompt = await this.llamaService.promptLlama({
        instructions: llamaInstructions,
        prompt,
      });

      console.debug('llamaPrompt', llamaPrompt);

      const agentResponse = await this.agentService.researchTravel(llamaPrompt, conversationId);

      const totalResponses = `
      ${agentResponse.response}
      ${agentResponse.sources?.map((source) => `- ${source}`).join('\n')}
      `;

      if (conversationId) {
        console.log(
          `📤 Sending progress to room ${conversationId}: 'Preparing your personalized response...'`
        );
        this.socketIOService.sendProgress(
          conversationId,
          'Preparing your personalized response...'
        );
      }

      const promptToTransformAgentResponseToReadable =
        this.promptsService.getPromptToTransformAgentResponseToReadable(totalResponses, userQuery);

      const readableResponse = await this.llamaService.promptLlama({
        instructions: llamaInstructions,
        prompt: promptToTransformAgentResponseToReadable,
      });

      if (conversationId) {
        this.socketIOService.sendProgress(
          conversationId,
          'Getting some images for you... Almost done.'
        );
      }

      const urlsFromResponse = this.extractUrlsFromText(readableResponse);
      const screenshotsWithUrls = await this.getScreenshotsWithFallback(urlsFromResponse, 2);

      console.log('screenshotsWithUrls', screenshotsWithUrls);

      if (conversationId) {
        await this.conversationsService.conversationInsert(
          readableResponse,
          conversationId as UUID,
          'assistant',
          screenshotsWithUrls
        );

        console.log(`📤 Sending final response to room ${conversationId}`);
        this.socketIOService.sendFinalResponse({
          conversationId,
          message: readableResponse,
          screenshotsWithUrls,
          isAskingForMoreInformation: false,
        });
      }

      return {
        readableResponse,
        screenshotsWithUrls,
      };
    } catch (error: unknown) {
      console.error('Error in processRequest', error);

      if (conversationId) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        this.socketIOService.sendToRoom(conversationId, 'agent-error', {
          error: errorMessage,
          timestamp: new Date(),
        });
      }
      return;
    }
  };
}
