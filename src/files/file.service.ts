import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError } from 'rxjs';
import { TransferIpfsFileDto } from 'src/files/dto/copy.dto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  constructor(private readonly httpService: HttpService) {}

  async copyFileToMfs(transferFileDto: TransferIpfsFileDto): Promise<void> {
    if (!transferFileDto) {
      throw new Error('Both source and destination paths are required.');
    }
    this.httpService
      .post(
        `http://localhost:5001/api/v0/files/cp?arg=/ipfs/${transferFileDto.sourceCID}&arg=/${transferFileDto.destination}`,
      )
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data);
          throw new BadRequestException('Have an error in server');
        }),
      );
  }
}
