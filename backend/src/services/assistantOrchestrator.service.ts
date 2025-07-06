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

  getTextFromInput = (input: { text?: string; audioFile?: AudioFile }) => {
    if (input.audioFile) return this.speechToTextService.transcribeAudio(input.audioFile);
    if (input.text) return input.text;
    throw new Error('No valid input provided. Please provide either text or an audio file.');
  };

  verifyQueryBeforeSendingToAgent = async (userQuery: string, conversationId: string) => {
    const prompt = this.promptsService.getPromptToVerifyQueryBeforeSendingToAgent(userQuery);
    const llamaInstructions = instructions.llamaBaseInstructions;
    const llamaResponse = await this.llamaService.promptLlama({
      instructions: llamaInstructions,
      prompt,
    });

    const cleanedResponse = this.cleanAssistantResponse(llamaResponse);

    if (conversationId) {
      await this.conversationsService.conversationInsert(
        cleanedResponse,
        conversationId as UUID,
        'assistant'
      );
    }

    return {
      isCorrect: llamaResponse.toLowerCase().includes('true'),
      response: cleanedResponse,
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

        // check if message is a knowledge important
        const knowledgeResult = await this.knowledgeService.evaluateMessage(newMessage);

        if (knowledgeResult.isRelevant && user) {
          await this.knowledgeService.knowledgeInsert(knowledgeResult, user.id);
        }

        console.log(`📤 Sending progress to room ${conversationId}: 'Processing your request...'`);
        this.socketIOService.sendProgress(conversationId, 'Processing your request...');
      }

      const prompt = this.promptsService.getPromptToTransformNewMessageToAgentPrompt(
        conversationHistory,
        newMessage
      );

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

      const cleanedReadableResponse = this.cleanAssistantResponse(readableResponse);

      if (conversationId) {
        await this.conversationsService.conversationInsert(
          cleanedReadableResponse,
          conversationId as UUID,
          'assistant'
        );
      }

      if (conversationId) {
        this.socketIOService.sendFinalResponse({
          conversationId,
          message: cleanedReadableResponse,
          isAskingForMoreInformation: false,
        });
      }
    } catch (error) {
      console.error('Error in processNewMessage', error);
    }
  };

  processRequest = async (userQuery: string, conversationId: string) => {
    try {
      if (!userQuery) {
        throw new Error('No valid input provided. Please provide either text or an audio file.');
      }

      console.debug('transcription', userQuery);

      // Sauvegarder le message de l'utilisateur
      if (conversationId) {
        const cleanedUserQuery = this.cleanAssistantResponse(userQuery);

        await this.conversationsService.conversationInsert(
          cleanedUserQuery,
          conversationId as UUID,
          'user'
        );

        console.log(`📤 Sending progress to room ${conversationId}: 'Processing your request...'`);
        this.socketIOService.sendProgress(conversationId, 'Processing your request...');
      }

      const isQueryCorrect = await this.verifyQueryBeforeSendingToAgent(userQuery, conversationId);

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

      const cleanedReadableResponse = this.cleanAssistantResponse(readableResponse);

      if (conversationId) {
        console.log(`📤 Sending final response to room ${conversationId}`);
        this.socketIOService.sendFinalResponse({
          conversationId,
          message: cleanedReadableResponse,
          isAskingForMoreInformation: false,
        });
      }

      return cleanedReadableResponse;
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

  private cleanAssistantResponse(response: string): string {
    const additionalInfoIndex = response.indexOf('Additional information:');
    if (additionalInfoIndex !== -1) {
      return response.split('Additional information:')[1].trim();
    }
    return response;
  }
}
