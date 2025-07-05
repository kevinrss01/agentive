import { Agent, run, webSearchTool } from '@openai/agents';
import { config } from '../config/config';
import { instructions } from './prompts/instructions';
import { SocketIOService } from './socketio.service';

// Set the OpenAI API key globally
if (config.openai.apiKey) {
  process.env.OPENAI_API_KEY = config.openai.apiKey;
}

export class AgentService {
  private agent: Agent;
  private socketIOService = SocketIOService.getInstance();

  constructor() {
    this.agent = new Agent({
      name: 'Travel Research Assistant',
      model: 'o4-mini',
      tools: [
        webSearchTool({
          searchContextSize: 'low',
        }),
      ],
      instructions: instructions.travelAgent,
    });
  }

  /**
   * Research travel information based on a user prompt
   * @param prompt - The travel query string (e.g., "I want to go from Paris to London on December 15th")
   * @param conversationId - Optional conversation ID for WebSocket updates
   * @returns Comprehensive travel information with sources
   */
  async researchTravel(
    prompt: string,
    conversationId?: string
  ): Promise<{
    response: string;
    sources?: string[];
  }> {
    try {
      console.log('\n=== Starting Travel Research ===');
      console.log(`📝 User prompt: "${prompt}"`);
      console.log('⏳ Processing...\n');

      // Send progress update if conversationId is provided
      if (conversationId) {
        this.socketIOService.sendProgress(
          conversationId,
          'The agent is looking for the best options...'
        );
      }

      const startTime = Date.now();

      const result = await run(this.agent, prompt);

      console.log('Result:', result);

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log(`\n✅ Agent completed in ${duration} seconds`);

      if (conversationId) {
        this.socketIOService.sendProgress(
          conversationId,
          'Travel research completed. Formatting results...'
        );
      }

      const response = result.finalOutput || 'No travel information could be generated.';
      const sources = this.extractSources(response);

      // Log summary
      console.log('\n📊 Summary:');
      console.log(`- Response length: ${response.length} characters`);
      console.log(`- Sources found: ${sources.length}`);
      if (sources.length > 0) {
        console.log('- Sources:');
        sources.forEach((source, index) => {
          console.log(`  ${index + 1}. ${source}`);
        });
      }
      console.log('=== Travel Research Completed ===\n');

      return {
        response,
        sources: sources.length > 0 ? sources : undefined,
      };
    } catch (error) {
      console.error('❌ Error researching travel:', error);
      throw new Error('Failed to research travel information');
    }
  }

  /**
   * Extract source URLs from the agent's response
   * Simple regex-based extraction for URLs
   */
  private extractSources(text: string): string[] {
    const urlRegex =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
    const matches = text.match(urlRegex) || [];

    return [...new Set(matches)];
  }
}
