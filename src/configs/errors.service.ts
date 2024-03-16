import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ErrorHandlingService {
  private readonly logger = new Logger(ErrorHandlingService.name);

  handle(error: any) {
    if (error.response) {
      this.logger.error(error.response.data);
      throw new HttpException(
        'Error communicating with IPFS server',
        error.response.status,
      );
    } else {
      this.logger.error(error.message);
      throw new HttpException(
        'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
