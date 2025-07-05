import Groq from 'groq-sdk';
import 'dotenv/config';

type AudioFile = {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
  size: number;
};

export class SpeechToTextService {
  private groq: Groq;

  constructor() {
    if (!process.env.GROQ_API_KEY)
      throw new Error('GROQ_API_KEY is not defined in environment variables');
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async transcribeAudio(audioFile: AudioFile): Promise<string> {
    const file = new File([audioFile.buffer], 'audio.webm', {
      type: audioFile.mimetype,
    });

    const transcription = await this.groq.audio.transcriptions.create({
      file: file,
      model: 'whisper-large-v3',
    });

    return transcription.text;
  }
}
