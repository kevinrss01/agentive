import { config } from 'dotenv';
import { AgentService } from '../src/services/agent.service';

// Load environment variables
config();

async function testTravelAgentInteractive() {
  // Get the prompt from command line arguments
  const args = process.argv.slice(2);
  const customPrompt = args.join(' ').trim();

  // Default prompt if no arguments provided (third person)
  const prompt =
    customPrompt ||
    `The user lives in Paris, specifically on the Champs-Elysées. 
    The user wants to travel to London. 
    The current date is June 28th. 
    The user wants to depart on June 30th in the morning.
    The user prefers to leave early in the morning for the journey.`;

  console.log('🚀 Testing Travel Agent Service...\n');

  // Initialize the agent service
  const agentService = new AgentService();

  console.log('📍 Travel Query:', prompt);
  console.log('\n⏳ Researching travel options...\n');

  try {
    // Call the research travel function
    const startTime = Date.now();
    const result = await agentService.researchTravel(prompt);
    const endTime = Date.now();

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

    console.log(`\n⏱️  Response time: ${(endTime - startTime) / 1000}s`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Show usage if --help is passed
if (process.argv.includes('--help')) {
  console.log(`
Travel Agent Test Tool

Usage:
  pnpm test:travel:custom [your travel query in third person]

Examples:
  pnpm test:travel:custom "The user wants to travel from New York to Boston tomorrow"
  pnpm test:travel:custom "The user wants to travel from Barcelona to Madrid with a budget of 100 euros"
  pnpm test:travel:custom "The user needs to travel from London to Edinburgh next Friday and return on Sunday"

Note: Write queries in third person (e.g., "The user wants to..." instead of "I want to...")

If no query is provided, it will use the default Paris to London example.
  `);
  process.exit(0);
}

// Run the test
testTravelAgentInteractive()
  .then(() => {
    console.log('\n✨ Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
