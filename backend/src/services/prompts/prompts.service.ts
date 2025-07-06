import { Message } from '@/types/types';

export const htmlInstructions = `
### HTML ELEMENTS TO USE ###
      - <h2>, <h3> for section headers
      - <ul>, <li> for lists
      - <strong> or <b> for emphasis
      - <a href="URL" target="_blank"> for ALL links
      - <p> for paragraphs
      - <table> if comparing options
      - <div> for organizing content
      - Any other HTML that helps present information clearly
`;

export class PromptsService {
  constructor() {
    //
  }

  getPromptToTransformUserQueryToAgentPrompt(userQuery: string): string {
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return `
      ### TASK ###
      Transform the user's query into a structured third-person format for the AI agent system. The query can be about:
      1. **Travel** - trips, destinations, transportation, accommodations
      2. **Shopping** - buying products online/in-store, checking availability, finding deals
      3. **Food/Restaurants** - finding restaurants, food recommendations, ratings, cuisine preferences

      ### INSTRUCTIONS ###
      1. First, identify which category (or categories) the query belongs to
      2. Extract all relevant information from the user's query
      3. Convert first-person statements to third-person (I/me → the user)
      4. Include the current date as context
      5. Structure the information based on the category:
         - **Travel**: origin, destination, dates, preferences, transport mode
         - **Shopping**: product/item, location, budget, online/in-store preference, urgency
         - **Food**: cuisine type, location, budget, dietary restrictions, occasion, preferences
      6. If information is missing, do NOT make assumptions - only include what's explicitly stated
      7. Maintain all specific details mentioned

      ### OUTPUT FORMAT ###
      Start with: "Category: [Travel/Shopping/Food/Multiple]"
      
      Then write clear, declarative sentences in third person:
      - "The user [action/need/want]..."
      - "The current date is [today's date]."
      - Include all relevant details for the identified category

      ### EXAMPLES ###

      Example 1 (Travel):
      User Query: "I want to go to London. I live in Paris. I want to leave in two days in the morning. I want a cheaper travel."
      Output:
      """
      Category: Travel
      The user lives in Paris.
      The user wants to travel to London.
      The current date is ${currentDate}.
      The user wants to depart in two days in the morning.
      The user prefers cheaper travel options.
      """

      Example 2 (Shopping):
      User Query: "I'm looking for a PlayStation 5 in stores near Manhattan. Need it by this weekend for my son's birthday."
      Output:
      """
      Category: Shopping
      The user is looking for a PlayStation 5.
      The user wants to buy it in physical stores near Manhattan.
      The current date is ${currentDate}.
      The user needs it by this weekend.
      The user is buying it for their son's birthday.
      """

      Example 3 (Food):
      User Query: "I want to find the best Italian restaurants in downtown Chicago. I'm vegetarian and my budget is around $50 per person."
      Output:
      """
      Category: Food
      The user wants to find Italian restaurants.
      The user is looking specifically in downtown Chicago.
      The current date is ${currentDate}.
      The user is vegetarian.
      The user has a budget of around $50 per person.
      The user wants the best-rated options.
      """

      Example 4 (Multiple):
      User Query: "I'm going to Tokyo next week and want to know the best sushi restaurants and where to buy authentic kimonos."
      Output:
      """
      Category: Multiple (Travel, Food, Shopping)
      The user is traveling to Tokyo next week.
      The current date is ${currentDate}.
      The user wants to find the best sushi restaurants in Tokyo.
      The user wants to buy authentic kimonos in Tokyo.
      """

      ### USER QUERY TO TRANSFORM ###
      Note: This is plain text from the user, not HTML.
      """
      ${userQuery}
      """

      ---

      RETURN ONLY the plain text response, nothing else. No JSON, no quotes, no commentary, no markdown, no HTML, no code blocks, just the plain text response.
`;
  }

  getPromptToTransformNewMessageToAgentPrompt(
    conversationHistory: Message[],
    newMessage: string
  ): string {
    return `
      ### TASK ###
      Transform the user's new message into a structured third-person format for the AI agent system.
      The conversation can be about Travel, Shopping, Food/Restaurants, or a combination of these.
      
      I will give you the conversation history between the user and the agent.
      Your role is to:
      1. Understand the context from the conversation history
      2. Identify what category the new message relates to
      3. Transform the new message into a structured format for the agent to research

      The new message might be:
      - A follow-up question on the same topic
      - A new request in the same category
      - A switch to a different category
      - Additional criteria or preferences
      - A clarification or modification of the previous request

      ### CONVERSATION HISTORY ###
      """
      ${conversationHistory.map((message) => message.content).join('\n')}
      """

      ### NEW MESSAGE ###
      """
      ${newMessage}
      """

      ### OUTPUT FORMAT ###
      Start with: "Category: [Travel/Shopping/Food/Multiple]"
      Then provide the structured request in third-person format.
      
      Include:
      - What specifically the user is asking for now
      - Any new constraints or preferences mentioned
      - Context from previous messages if relevant
      - Clear action items for the agent to research

      ### EXAMPLES ###
      
      Example 1 (Travel follow-up):
      Previous: User asked about flights to London
      New Message: "What about train options instead?"
      Output:
      """
      Category: Travel
      The user now wants to know about train options to London instead of flights.
      The user is still traveling from the previously mentioned origin.
      """

      Example 2 (Shopping new criteria):
      Previous: User asked about PlayStation 5 availability
      New Message: "Are there any bundles with extra controllers? And what about the Xbox Series X?"
      Output:
      """
      Category: Shopping
      The user wants to know about PlayStation 5 bundles that include extra controllers.
      The user also wants information about Xbox Series X availability.
      The user is still looking in the previously mentioned location.
      """

      Example 3 (Food refinement):
      Previous: User asked about Italian restaurants
      New Message: "Actually, I'd prefer something with outdoor seating and live music"
      Output:
      """
      Category: Food
      The user still wants Italian restaurants but now with specific requirements.
      The user requires outdoor seating.
      The user wants restaurants with live music.
      The location and budget constraints remain the same as previously mentioned.
      """

      RETURN ONLY the agent prompt, nothing else.

    `;
  }

  getPromptToTransformNewMessageToReadable(
    agentResponse: string,
    newMessage: string,
    conversationHistory: Message[]
  ): string {
    return `
      ### TASK ###
      The user already received their first response, but they asked a follow-up question or made a new request.
      The agent has researched and provided new information based on their latest message.
      
      Transform the agent's response into a friendly, readable format that:
      1. Directly addresses what the user asked for
      2. Maintains context from the conversation
      3. Is formatted appropriately for the category (Travel/Shopping/Food)
      
      Remember: This is a continuation of an existing conversation, so avoid redundant greetings.
      Simply provide the new information in a natural, conversational way.
      
      ### GUIDELINES BY CATEGORY ###
      
      **For Travel Updates:**
      - Present new travel options or changes clearly
      - Compare with previously discussed options if relevant
      - Highlight what's different or additional
      
      **For Shopping Updates:**
      - Focus on availability and specific product details requested
      - Include prices, store locations, or online links
      - Mention any deals or bundles if found
      
      **For Food/Restaurant Updates:**
      - Present restaurants that match new criteria
      - Include ratings, prices, and specific features requested
      - Provide reservation/contact information when available

      ${htmlInstructions}

      ### TONE ###
      - Be direct and helpful
      - Reference their specific request
      - Use a conversational tone as if continuing a discussion
      - Include relevant emojis sparingly where appropriate

      ### CRITICAL REQUIREMENTS ###
      - Answer in the SAME LANGUAGE as the user's message
      - Include ALL URLs from the agent response as clickable links
      - Format the response in HTML
      - Be concise but comprehensive

      ### AGENT RESPONSE ###
      """
      ${agentResponse}
      """

      ### NEW MESSAGE ###
      """
      ${newMessage}
      """

      ### CONVERSATION HISTORY ###
      """
      ${conversationHistory.map((message) => message.content).join('\n')}
      """

      ---

      Return ONLY the HTML formatted response in the user's language. No quotes, no markdown, no code blocks, just the HTML response.
    `;
  }

  getPromptToTransformAgentResponseToReadable(
    agentResponse: string,
    originalUserQuery: string
  ): string {
    return `
      ### TASK ###
      Transform the agent's research response into a friendly, comprehensive guide based on the query category.
      The response should feel like advice from a knowledgeable friend who genuinely wants to help.

      ### CRITICAL REQUIREMENTS ###
      1. **LANGUAGE**: You MUST answer in the SAME LANGUAGE as the user's query. If the user wrote in French, answer in French. If in Spanish, answer in Spanish. This is MANDATORY.
      2. **PRESERVE ALL URLs**: Include EVERY URL and link mentioned in the agent response. Make them clickable with proper <a> tags, add the sources at the end of the response.
      3. **BE EXTREMELY DETAILED**: Provide extensive information. The more details, the better. Include prices, times, tips, warnings, alternatives, and personal insights.
      4. **CATEGORY-APPROPRIATE**: Structure your response based on whether it's Travel, Shopping, or Food/Restaurant related.

      ### CONTEXT ###
      Original User Query: """
      ${originalUserQuery}
      """

      ### GUIDELINES BY CATEGORY ###

      **FOR TRAVEL QUERIES:**
      1. **Friendly Opening**
         - Greet warmly in THEIR LANGUAGE
         - Acknowledge their travel plans
         - Overview of what you'll cover
      
      2. **Travel Options** (VERY DETAILED)
         - Each option with ALL details
         - Exact prices, times, routes
         - ALL booking links
         - Personal recommendations
         - Best option recommendation with reasoning
      
      3. **Booking Tips**
         - Best booking strategies
         - Hidden fees warnings
         - Cancellation policies
      
      4. **Preparation Checklist**
         - Required documents
         - Packing suggestions
         - Money/payment tips
      
      5. **Journey Day Guide**
         - Step-by-step timeline
         - Getting to departure points
         - What to expect
      
      6. **Destination Essentials**
         - Local transport
         - Weather and clothing
         - Cultural tips
         - Safety info
      
      7. **Resources**
         - ALL mentioned apps/websites
         - Emergency contacts

      **FOR SHOPPING QUERIES:**
      1. **Friendly Opening**
         - Acknowledge what they're looking for
         - Express enthusiasm to help
      
      2. **Product Availability** (COMPREHENSIVE)
         - Where it's available (stores/online)
         - Current stock status
         - Exact prices at each location
         - ALL store addresses with hours
         - ALL online links
      
      3. **Best Options**
         - Compare different sellers
         - Highlight best deals
         - Recommend best option with reasoning
      
      4. **Alternative Products**
         - Similar items if main product unavailable
         - Pros/cons comparison
      
      5. **Shopping Tips**
         - Best times to shop
         - Return policies
         - Warranty information
         - Payment options
      
      6. **Deals & Savings**
         - Current promotions
         - Coupon codes
         - Bundle deals
         - Price match policies

      **FOR FOOD/RESTAURANT QUERIES:**
      1. **Friendly Opening**
         - Acknowledge their dining preferences
         - Show excitement about recommendations
      
      2. **Restaurant Recommendations** (DETAILED)
         - Name, cuisine type, atmosphere
         - Exact address with map links
         - Phone numbers
         - Hours of operation
         - Price range with examples
         - Ratings and reviews summary
         - Signature dishes
         - Reservation links/info
      
      3. **Top Picks**
         - Your personal top 3-5 recommendations
         - Why each one stands out
         - Best for different occasions
      
      4. **Dietary Accommodations**
         - How each place handles restrictions
         - Menu flexibility
         - Special dietary menus
      
      5. **Insider Tips**
         - Best times to visit
         - Must-try dishes
         - Parking/transport info
         - Dress code if applicable
      
      6. **Alternatives**
         - Backup options
         - Different cuisine suggestions
         - Delivery/takeout options

      ${htmlInstructions}

      ### TONE ###
      Be warm, helpful, and reassuring. Write as if you're a well-informed friend sharing advice over coffee. 
      Add personality and genuine enthusiasm. But remember - ALWAYS in the user's language!

      ### STRUCTURE ###
      - Use clear headings for each section
      - Bullet points for lists
      - Bold for important information
      - Include relevant emojis naturally
      - Create visual hierarchy for easy scanning

      ### IMPORTANT REMINDERS ###
      - Answer in the USER'S LANGUAGE
      - Include EVERY URL as a clickable link
      - Be as detailed and comprehensive as possible
      - Don't summarize - expand with helpful additions
      - Recommend the best option when applicable

      ### AGENT RESPONSE TO TRANSFORM ###
      """
      ${agentResponse}
      """

     ---

     Return ONLY the HTML formatted response in the USER'S LANGUAGE. Nothing else - no quotes, no markdown, no code blocks. Make it extremely detailed, helpful, and human. Include ALL URLs as clickable links.
`;
  }

  getPromptToVerifyQueryBeforeSendingToAgent(userQuery: string): string {
    return `
      You are in MODE 3.

      ### TASK ###
      Verify the user's query before sending it to the AI agent.
      The query can be about Travel, Shopping, or Food/Restaurants.

      ### VERIFICATION CRITERIA BY CATEGORY ###

      **For TRAVEL queries:**
      - Must have: departure location (city/area)
      - Must have: destination location  
      - Should have: approximate travel date/time
      - Nice to have: preferences (budget, transport mode, etc.)

      **For SHOPPING queries:**
      - Must have: what product/item they want
      - Should have: location (for in-store) OR online preference
      - Nice to have: budget, urgency, specific requirements

      **For FOOD/RESTAURANT queries:**
      - Must have: location (city/area)
      - Should have: cuisine type OR restaurant type
      - Nice to have: budget, dietary restrictions, occasion

      ### OUTPUT FORMAT ###
      - If the query has MINIMUM required information for its category, return only: true
        (in lowercase, nothing else, no quotes, so it can be parsed directly)
      
      - If the query LACKS essential information, return a friendly HTML message in the user's language:
        * Acknowledge what they're looking for
        * Politely explain what information is missing
        * Ask for the specific details needed
        * Give examples if helpful

      ${htmlInstructions}

      ### USER QUERY TO VERIFY ###
      """
      ${userQuery}
      """

      ---
    `;
  }
}

export default PromptsService;
