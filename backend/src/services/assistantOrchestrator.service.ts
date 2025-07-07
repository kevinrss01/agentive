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

export class AssistantOrchestratorService {
  private speechToTextService = new SpeechToTextService();
  private llamaService = new LlamaService();
  private agentService = new AgentService();
  private promptsService = new PromptsService();
  private socketIOService = SocketIOService.getInstance();
  private conversationsService = new ConversationsService();
  private knowledgeService = new KnowledgeService();

  private async prependKnowledgeContext(prompt: string, userId?: number) {
    const knowledgeContext = await this.knowledgeService.getUserKnowledgeContext(userId);

    if (!knowledgeContext) return prompt;

    return `### USER KNOWLEDGE CONTEXT ###\n"""\n${knowledgeContext}\n"""\n\n${prompt}`;
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
      console.log('prompt avec les infos2', prompt);

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
        await this.conversationsService.conversationInsert(
          readableResponse,
          conversationId as UUID,
          'assistant'
        );
      }

      if (conversationId) {
        this.socketIOService.sendFinalResponse({
          conversationId,
          message: readableResponse,
          isAskingForMoreInformation: false,
        });
      }
    } catch (error) {
      console.error('Error in processNewMessage', error);
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

      if (isQueryCorrect.response) {
        await this.conversationsService.conversationInsert(
          isQueryCorrect.response,
          conversationId as UUID,
          'assistant'
        );
      }

      if (!isQueryCorrect.isCorrect) {
        if (conversationId) {
          this.socketIOService.sendFinalResponse({
            conversationId,
            message: isQueryCorrect.response,
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
        console.log(`📤 Sending final response to room ${conversationId}`);
        this.socketIOService.sendFinalResponse({
          conversationId,
          message: readableResponse,
          isAskingForMoreInformation: false,
        });
      }

      return readableResponse;
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
