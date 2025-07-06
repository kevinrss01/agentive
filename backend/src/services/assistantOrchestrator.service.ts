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

export class AssistantOrchestratorService {
  private speechToTextService = new SpeechToTextService();
  private llamaService = new LlamaService();
  private agentService = new AgentService();
  private promptsService = new PromptsService();
  private socketIOService = SocketIOService.getInstance();
  private conversationsService = new ConversationsService();

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

    if (conversationId) {
      await this.conversationsService.conversationInsert(
        llamaResponse,
        conversationId as UUID,
        'assistant'
      );
    }

    return {
      isCorrect: llamaResponse.toLowerCase().includes('true'),
      response: llamaResponse,
    };
  };

  processNewMessage = async ({
    conversationHistory,
    newMessage,
    conversationId,
  }: {
    conversationHistory: Message[];
    newMessage: string;
    conversationId?: string;
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

  processRequest = async (userQuery: string, conversationId: string) => {
    try {
      if (!userQuery) {
        throw new Error('No valid input provided. Please provide either text or an audio file.');
      }

      console.debug('transcription', userQuery);

      // Sauvegarder le message de l'utilisateur
      if (conversationId) {
        await this.conversationsService.conversationInsert(
          userQuery,
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
