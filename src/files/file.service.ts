import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { fixRouteAddFiles } from 'helpers/ipfsRoute';
import { catchError, firstValueFrom } from 'rxjs';
import { TransferIpfsFileDto } from 'src/files/dto/copy.dto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  constructor(private readonly httpService: HttpService) {}

  domainNgRok: string = 'morally-immune-blowfish.ngrok-free.app';

  async uploadFile(
    file: Express.Multer.File,
    folderName: string,
    fileName: string,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('File not found');
      }

      const formData = new FormData();
      const newFileName = fixRouteAddFiles(folderName, fileName);

      const fileData = fs.readFileSync(file.path);
      formData.append('file', fileData, {
        filename: newFileName || file.originalname,
      });

      const response = await firstValueFrom(
        this.httpService.post(
          `https://${this.domainNgRok}/api/v0/add?to-files=/evidenceFolder`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              ...formData.getHeaders(),
            },
          },
        ),
      );
      console.log('data: ' + response.data);
      return response.data;
    } catch (error) {
      throw new BadRequestException(error);
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
