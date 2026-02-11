import { Injectable } from '@nestjs/common';
import { languages } from '../../../packages/shared/dist';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getLanguages() {
    return languages;
  }
}
