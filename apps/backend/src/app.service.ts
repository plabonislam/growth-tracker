import { Injectable } from '@nestjs/common';
import { languages, type Language } from 'shared';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getLanguages(): Language[] {
    return languages;
  }
}
