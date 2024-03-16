import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Ipfs } from '@prisma/client';
import FormData from 'form-data';
import * as fs from 'fs';
import { fixRouteAddFiles, getLinkIpfs } from 'helpers';
import { firstValueFrom } from 'rxjs';
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

  fileStatus = async (cid: string): Promise<StatusResponseDto> => {
    if (!cid) throw new BadRequestException('cid must be provided');

    const response = await firstValueFrom(
      this.httpService.post(
        `https://${this.domainNgRok}/api/v0/files/stat?arg=/ipfs/${cid}`,
      ),
    );

    return this.ipfsMapper.mapResponseToStatusResponseDto(response.data);
  };

  private domainNgRok: string = 'morally-immune-blowfish.ngrok-free.app';

  contentDirectory = async (folderCid: string): Promise<string> => {
    const response = await firstValueFrom(
      this.httpService.post(
        `https://${this.domainNgRok}/api/v0/ls?arg=/ipfs/${folderCid}`,
      ),
    );
    return response.data;
  };

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

  uploadFile = async (file: Express.Multer.File, nameFolderMfs: string) => {
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
  };

  uploadMutipleFiles = async (
    files: Express.Multer.File[],
    nameFolder: string,
  ) => {
    const formData = new FormData();

    for (const file of files) {
      const fileData = fs.readFileSync(file.path);
      const addFolderName = fixRouteAddFiles(nameFolder, file.originalname);
      formData.append('file', fileData, {
        filename: addFolderName || file.originalname,
      });
    }

    const response = await this.uploadFormData(formData);

    return this.ipfsMapper.mapToUploadResponseDto(response.data);
  };

  async copyFileToMfs(transferFileDto: TransferIpfsFileDto): Promise<void> {
    if (!transferFileDto) {
      throw new Error('Both source and destination paths are required.');
    }
    await firstValueFrom(
      this.httpService.post(
        `http://${this.domainNgRok}/api/v0/files/cp?arg=/ipfs/${transferFileDto.sourceCID}&arg=/${transferFileDto.destination}`,
      ),
    );
    this.logger.log('Move file to mfs successfully');
  }

  checkExistCid = async (folderCid: string): Promise<boolean> => {
    const count = await this.prismaService.ipfs.count({
      where: { folderCid: folderCid },
    });

    return count > 0;
  };

  addIpfs = async (userId: number, addFileDto: AddFileIpfsDto) => {
    if (await this.checkExistCid(addFileDto.folderCid)) {
      throw new BadRequestException('exist cid');
    }

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

    this.logger.log('Created ipfs successfully');
    return fileIpfs;
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
