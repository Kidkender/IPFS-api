import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { catchError, firstValueFrom } from 'rxjs';
import { TransferIpfsFileDto } from 'src/files/dto/copy.dto';
import { AddFileIpfsDto } from 'src/ipfs/dto/add.dto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  constructor(private readonly httpService: HttpService) {}

  domainNgRok: string = 'morally-immune-blowfish.ngrok-free.app';

  async uploadFile(file: Express.Multer.File, nameFolderMfs: string) {
    try {
      if (!file) {
        throw new BadRequestException('File not found');
      }

      const formData = new FormData();

      const fileData = fs.readFileSync(file.path);
      formData.append('file', fileData, {
        filename: file.originalname,
      });

      const response = await firstValueFrom(
        this.httpService.post(
          `https://${this.domainNgRok}/api/v0/add?to-files=/${nameFolderMfs}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              ...formData.getHeaders(),
            },
          },
        ),
      );

      const responseData = response.data
        .split('\n')
        .filter((item) => !!item)
        .map((item) => JSON.parse(item));

      const addFileIpfsDto = new AddFileIpfsDto();

      return responseData;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  uploadWithWrapDirectory = async (file: Express.Multer.File) => {
    if (!file) {
      throw new BadRequestException('File  not found');
    }

    const formData = new FormData();
    const fileData = fs.readFileSync(file.path);
    formData.append('file', fileData, {
      filename: file.originalname,
    });

    const response = await firstValueFrom(
      this.httpService.post(
        `https://${this.domainNgRok}/api/v0/add?wrap-with-directory=true&to-files=/evidenceFolder`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...formData.getHeaders(),
          },
        },
      ),
    );
    console.log('Data: ', response.data);
    return response.data;
  };

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
