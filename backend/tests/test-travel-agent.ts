import { config } from 'dotenv';
import { AgentService } from '../src/services/agent.service';

// Load environment variables
config();

async function testTravelAgent() {
  console.log('🚀 Testing Travel Agent Service...\n');

  // Initialize the agent service
  const agentService = new AgentService();

  // Create the test prompt in third person
  const testPrompt = `The user lives in Paris, specifically on the Champs-Elysées. 
The user wants to travel to London. 
The current date is June 28th. 
The user wants to depart on June 30th in the morning.
The user prefers to leave early in the morning for the journey.`;

  console.log('📍 Travel Query:', testPrompt);
  console.log('\n⏳ Researching travel options...\n');

  try {
    // Call the research travel function
    const result = await agentService.researchTravel(testPrompt);

    console.log('✅ Travel Research Results:\n');
    console.log('='.repeat(80));
    console.log(result.response);
    console.log('='.repeat(80));

    if (result.sources && result.sources.length > 0) {
      console.log('\n📚 Sources found:');
      result.sources.forEach((source, index) => {
        console.log(`${index + 1}. ${source}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testTravelAgent()
  .then(() => {
    console.log('\n✨ Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
