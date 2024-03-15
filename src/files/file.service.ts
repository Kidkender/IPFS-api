import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import { catchError, firstValueFrom } from 'rxjs';
import { TransferIpfsFileDto } from 'src/files/dto/copy.dto';
import { IpfsService } from 'src/ipfs/ipfs.service';
import { AddFileIpfsDto } from 'src/ipfs/dto/add.dto';
import { fixRouteAddFiles } from 'helpers';
import { FileMapper } from './mapper/fileMapper';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly ipfsService: IpfsService,
    private readonly fileMapper: FileMapper,
  ) {}

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
      return response.data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  uploadMutipleFiles = async (
    files: Express.Multer.File[],
    nameFolder: string,
  ) => {
    try {
      const formData = new FormData();

      for (const file of files) {
        const fileData = fs.readFileSync(file.path);
        const addFolderName = fixRouteAddFiles(nameFolder, file.originalname);
        this.logger.log('file name: ', addFolderName);
        formData.append('file', fileData, {
          filename: addFolderName || file.originalname,
        });
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `https://${this.domainNgRok}/api/v0/add`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              ...formData.getHeaders(),
            },
          },
        ),
      );

      const dataMapper = this.fileMapper.mapToUploadResponseDto(response.data);

      console.log('Show: ', dataMapper);
      return dataMapper;
    } catch (error) {}
  };

  uploadWithWrapDirectory = async (
    userId: number,
    file: Express.Multer.File,
  ) => {
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
    const { Name, Hash, Size } = response.data;
    const addFileIpfsDto = new AddFileIpfsDto();
    addFileIpfsDto.fileName = Name;
    addFileIpfsDto.folderCid = Hash;
    addFileIpfsDto.sizeFolder = Number(Size);

    await this.ipfsService.addIpfs(userId, addFileIpfsDto);
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
