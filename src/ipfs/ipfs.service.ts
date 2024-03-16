import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Ipfs } from '@prisma/client';
import { AxiosError } from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import { fixRouteAddFiles, getLinkIpfs } from 'helpers';
import { catchError, firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddFileIpfsDto, StatusResponseDto, TransferIpfsFileDto } from './dto';
import { IPFSMapper } from './mapper/ipfs.mapper';

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  constructor(
    private prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly ipfsMapper: IPFSMapper,
  ) {}

  async fileStatus(cid: string): Promise<StatusResponseDto> {
    if (!cid) throw new BadRequestException('cid is required');

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://morally-immune-blowfish.ngrok-free.app/api/v0/files/stat?arg=/ipfs/${cid}`,
        ),
      );
      const dataMapper = this.ipfsMapper.mapResponseToStatusResponseDto(
        response.data,
      );

      this.logger.log(dataMapper);
      return dataMapper;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  contentDirectory = async (folderCid: string): Promise<string> => {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://morally-immune-blowfish.ngrok-free.app/api/v0/ls?arg=/ipfs/${folderCid}`,
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error.message);
    }
  };

  // add new --------------
  domainNgRok: string = 'morally-immune-blowfish.ngrok-free.app';

  private uploadFormData = async (
    formData: FormData,
    nameFolderMfs?: string,
  ) => {
    const url = nameFolderMfs
      ? `https://${this.domainNgRok}/api/v0/add?to-files=/${nameFolderMfs}`
      : `https://${this.domainNgRok}/api/v0/add`;

    return await firstValueFrom(
      this.httpService.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...formData.getHeaders(),
        },
      }),
    );
  };
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

      const response = await this.uploadFormData(formData);
      return response.data;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);

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

      const response = await this.uploadFormData(formData);
      const data = response.data;

      return this.ipfsMapper.mapToUploadResponseDto(data);
    } catch (error) {
      this.logger.error(`Error uploading multiple files: ${error.message}`);

      console.log(error);
    }
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
  //  add new --------------
  checkExistCid = async (folderCid: string): Promise<boolean> => {
    const ipfs = await this.prismaService.ipfs.findUnique({
      where: { folderCid: folderCid },
    });

    return !!ipfs;
  };
  addIpfs = async (userId: number, addFileDto: AddFileIpfsDto) => {
    if (await this.checkExistCid(addFileDto.folderCid)) {
      throw new BadRequestException('exist cid');
    }

    try {
      const linkFile: string = getLinkIpfs(addFileDto.folderCid);

      const fileIpfs = await this.prismaService.ipfs.create({
        data: {
          name: addFileDto.fileName,
          folderCid: addFileDto.folderCid,
          sizeFolder: addFileDto.sizeFolder,
          linkIpfs: linkFile,
          userId,
        },
      });

      return fileIpfs;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(error.message);
    }
  };

  getAllIpfs = async () => {
    const allIpfs = await this.prismaService.ipfs.findMany();
    return allIpfs;
  };

  getIpfsByUserId = async (userId: number): Promise<Ipfs[]> => {
    const ipfs = await this.prismaService.ipfs.findMany({
      where: { userId: userId },
    });
    return ipfs;
  };
}
