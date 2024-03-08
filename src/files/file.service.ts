import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import * as FormData from 'form-data';
import { catchError, firstValueFrom } from 'rxjs';
import { TransferIpfsFileDto } from 'src/files/dto/copy.dto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  constructor(private readonly httpService: HttpService) {}

  async uploadFile(file: Express.Multer.File) {
    try {
      const formData = new FormData();

      formData.append('file', file.buffer, {
        filename: file.originalname,
      });

      const response = await firstValueFrom(
        this.httpService.post(
          'http://127.0.0.1:5001/api/v0/add?pin=true&wrap-with-directory=true',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              ...formData.getHeaders(),
            },
          },
        ),
      );

      console.log(response.data);

      return response.data;
    } catch (error) {
      throw Error(error.message);
    }
  }

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
