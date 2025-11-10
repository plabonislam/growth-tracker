/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { languages } from 'shared';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getLanguages() {
    return languages;
  }
}
