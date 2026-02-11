import { Controller, Get } from '@nestjs/common';
import { Language } from '../../../packages/shared/dist';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('languages')
  getLanguages(): Language[] {
    return this.appService.getLanguages();
  }
}
