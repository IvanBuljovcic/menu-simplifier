import { Controller, Get, Query } from '@nestjs/common';
import { AppService, ScrapeReturn } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('scrape')
  async scrape(@Query('url') url: string): Promise<ScrapeReturn> {
    if (!url) {
      throw new Error('URL is required!');
    }

    return this.appService.scrapeWebPage(url);
  }
}
