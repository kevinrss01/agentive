import Groq from 'groq-sdk';
import 'dotenv/config';

export class LlamaService {
  private groq: Groq;

  constructor() {
    if (!process.env.GROQ_API_KEY)
      throw new Error('GROQ_API_KEY is not defined in environment variables');
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async promptLlama({ instructions, prompt }: { instructions: string; prompt: string }) {
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: instructions,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
        temperature: 0.5,
        max_completion_tokens: 8000,
        top_p: 1,
        stream: false,
        stop: null,
      });

      const response = chatCompletion.choices[0].message.content;

      if (!response) throw new Error('No response from llama');

      return response;
    } catch (error) {
      console.error('Error in promptLlama', error);
      throw error;
    }
  }
}
