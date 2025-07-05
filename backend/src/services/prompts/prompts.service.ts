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
      Transform the user's travel query into a structured third-person format for the travel agent system.

      ### INSTRUCTIONS ###
      1. Extract all travel-related information from the user's query
      2. Convert first-person statements to third-person (I/me → the user)
      3. Include the current date as context
      4. Identify and structure: origin location, destination, travel dates, preferences
      5. If information is missing, do NOT make assumptions - only include what's explicitly stated
      6. Maintain all specific details mentioned (street names, neighborhoods, time preferences, budget constraints)

      ### OUTPUT FORMAT ###
      Write the output as clear, declarative sentences in third person:
      - "The user lives in [location, with specific details if provided]."
      - "The user wants to travel to [destination]."
      - "The current date is [today's date]."
      - "The user wants to depart on [date and time if specified]."
      - Include any preferences mentioned (budget, transport mode, time of day, etc.)

      ### EXAMPLES ###

      Example 1:
      User Query: "I want to go to London. I live in Paris. I want to leave in two days in the morning. I want a cheaper travel."
      Output:
      """
      The user lives in Paris.
      The user wants to travel to London.
      The current date is ${currentDate}.
      The user wants to depart in two days in the morning.
      The user prefers cheaper travel options.
      """

      Example 2:
      User Query: "I'm in Berlin near Alexanderplatz and need to get to Amsterdam tomorrow afternoon. I prefer trains over flights."
      Output:
      """
      The user lives in Berlin, specifically near Alexanderplatz.
      The user wants to travel to Amsterdam.
      The current date is ${currentDate}.
      The user wants to depart tomorrow in the afternoon.
      The user prefers trains over flights.
      """

      Example 3:
      User Query: "Looking to travel from Barcelona to Rome next Friday. I'm staying at the Gothic Quarter. Budget is important but comfort too."
      Output:
      """
      The user lives in Barcelona, specifically in the Gothic Quarter.
      The user wants to travel to Rome.
      The current date is ${currentDate}.
      The user wants to depart next Friday.
      The user values both budget-friendly options and comfort.
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
      Transform the user's new message into a structured third-person format for the travel agent system.
      I will give you the all conversation history between the user and the agent.
      And your role is to understand the user's new message and transform it into a structured third-person format for the travel agent system.
      It can be most of the time a new question or a new message, but it can also be a new request for the same question.
      You have to understand the user's new message and transform it into a structured third-person format for the travel agent system.
      This agent should make a new research on the web based on the user's new message.

      ### CONVERSATION HISTORY ###
      """
      ${conversationHistory.map((message) => message.content).join('\n')}
      """

      ### NEW MESSAGE ###
      """
      ${newMessage}
      """

      RETURN ONlY the agent prompt, nothing else.

    `;
  }

  getPromptToTransformNewMessageToReadable(
    agentResponse: string,
    newMessage: string,
    conversationHistory: Message[]
  ): string {
    return `
      ### TASK ###
      The user already received his first guide, but he asked for a new question or he just had a new message, and so we made a new research based on his last message.
      The user agent returned something else, so you have to adapt it and respond with the agent request based on the user request.
 
       You have to make something readable. You don't need to say "hello again" because this is a new message in a conversation. Please understand that and just answer in HTML.
       Return in language of the user.

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


    `;
  }

  getPromptToTransformAgentResponseToReadable(
    agentResponse: string,
    originalUserQuery: string
  ): string {
    return `
      ### TASK ###
      Transform the travel agent response into a friendly, comprehensive travel guide in HTML format. Make it feel like advice from a knowledgeable friend who genuinely wants to help.

      ### CRITICAL REQUIREMENTS ###
      1. **LANGUAGE**: You MUST answer in the SAME LANGUAGE as the user's query. If the user wrote in French, answer in French. If in Spanish, answer in Spanish. This is MANDATORY.
      2. **PRESERVE ALL URLs**: Include EVERY URL and link mentioned in the agent response. Make them clickable with proper <a> tags, add the sources at the end of the response.
      3. **BE EXTREMELY DETAILED**: Provide extensive information. The more details, the better. Include prices, times, tips, warnings, alternatives, and personal insights.

      ### CONTEXT ###
      Original User Query: """
      ${originalUserQuery}
      """

      ### GUIDELINES ###
      - Write naturally and conversationally, as if talking to a friend
      - Use HTML formatting (no markdown)
      - Be VERY comprehensive and detailed - aim for a thorough guide
      - Include emojis where they feel natural
      - Make ALL links clickable with <a href="URL" target="_blank">
      - Extract and include EVERY piece of information from the agent response
      - Add your own helpful insights and tips to make it even more valuable

      ### MAIN SECTIONS TO INCLUDE ###
      
      1. **Friendly Opening**
         - Greet them warmly in THEIR LANGUAGE
         - Acknowledge their travel plans
         - Give a detailed overview of what you'll cover
      
      2. **Travel Options** (BE VERY DETAILED)
         - Present each option with ALL available details
         - Include exact prices, all time variations, multiple routes
         - Include ALL booking links from the agent response
         - Compare options thoroughly
         - Add personal recommendations and insights
         - **After presenting all options**: If relevant and helpful, clearly state which option you recommend as the best choice and explain why (considering factors like price, comfort, time, and the user's specific needs)
      
      3. **Booking Tips** (COMPREHENSIVE)
         - Best booking strategies and timing
         - Price comparison tips
         - Hidden fees to watch for
         - Cancellation and change policies
         - Loyalty programs and discounts
      
      4. **Preparation Checklist** (EXHAUSTIVE)
         - All required documents with specific details
         - Detailed packing list based on destination/weather
         - Money and payment method recommendations
         - Technology and connectivity preparation
         - Health and insurance considerations
      
      5. **Journey Day Guide** (STEP-BY-STEP)
         - Detailed timeline with buffer times
         - Multiple ways to reach departure points
         - Check-in and security procedures
         - What to expect at each stage
         - Contingency plans for delays
      
      6. **Destination Essentials** (THOROUGH)
         - Local transport options with prices and apps
         - Weather patterns and clothing advice
         - Cultural tips and etiquette
         - Safety considerations
         - Must-know local information
         - Emergency contacts and procedures
      
      7. **Helpful Resources** (COMPLETE LIST)
         - ALL apps and websites mentioned by the agent
         - Additional useful resources
         - Community forums and groups
         - Real-time information sources
         - Offline backup options

      ${htmlInstructions}

      ### TONE ###
      Be warm, helpful, and reassuring. Write as if you're a well-traveled friend sharing advice over coffee. Add personality and genuine enthusiasm for their trip. But remember - ALWAYS in the user's language!

      ### IMPORTANT REMINDERS ###
      - If the user query is in French, your ENTIRE response must be in French
      - If the user query is in Spanish, your ENTIRE response must be in Spanish
      - Include EVERY URL from the agent response as a clickable link
      - Make your response as detailed and comprehensive as possible
      - Don't just summarize - expand on the information with helpful additions

      ### AGENT RESPONSE TO TRANSFORM ###
      """
      ${agentResponse}
      """

     ---

     Return ONLY the HTML formatted response in the USER'S LANGUAGE nothing else not quotes, no markdown, no code blocks, no JSON, no XML, no HTML, no XML, no JSON, no code blocks, no markdown, no quotes, nothing else. Make it extremely detailed, helpful, and human. Include ALL URLs as clickable links.
`;
  }

  getPromptToVerifyQueryBeforeSendingToAgent(userQuery: string): string {
    return `
      You are in MODE 3.

      ### TASK ###
      Verify the user's query before sending it to the travel agent.

      For travel tasks:
      - Checks that the user's query contains basic information, such as the departure location, an approximate time, a day, a destination location, a destination date, and also information about their preferences, how they get there.

      ### OUTPUT FORMAT ###
      - If the query is correct, return only true in LOWERCASE, with nothing else, no quotes, absolutely nothing else, so that it can be parsed directly.
      - If the query is NOT correct, return a friendly message in the user's language telling the user that the query lacks information to perform a search and asks what you need. Return the message in HTML format. RETURN only the message nothing else, no commentary, you are talking directly to the customer. 

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
