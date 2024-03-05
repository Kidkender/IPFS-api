import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getNewText(): string {
    return 'Hello duc ne ';
  }
}
