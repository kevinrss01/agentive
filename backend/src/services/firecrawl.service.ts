import FireCrawlApp from '@mendable/firecrawl-js';

export class FirecrawlService {
  private app: FireCrawlApp;

  constructor() {
    this.app = new FireCrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY,
      apiUrl: process.env.FIRECRAWL_BASE_URL,
    });
  }

  getScreenshotFromUrl = async (url: string) => {
    const scrapeResult = await this.app.scrapeUrl(url, {
      formats: ['markdown', 'screenshot'],
      onlyMainContent: true,
      parsePDF: true,
      maxAge: 14400000,
    });

    if (scrapeResult.success && scrapeResult.screenshot) {
      return scrapeResult.screenshot;
    }

    throw new Error('Failed to get screenshot from URL');
  };
}
