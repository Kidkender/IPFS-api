import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ipfs } from '@prisma/client';
import {
  ERROR_CID_ALREADY_EXIST,
  ERROR_CID_NOT_FOUND,
  VALIDATE_CID_REQUIRED,
} from 'constant';
import FormData from 'form-data';
import * as fs from 'fs';
import { fixRouteAddFiles, getLinkIpfs } from 'helpers';
import { firstValueFrom } from 'rxjs';
import { handleHttpRequestError } from 'src/configs/httpErrors';
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
    private readonly configService: ConfigService,
  ) {}

  private domainNgRok: string = this.configService.get('NGROK_DOMAIN');

  /**
   * Retrieve the status of a file/folder stored in IPFS using the provided CID.
   *
   * @param cid The Content Identifier of the file/folder in IPFS
   * @returns A promise resolving to StatusResponseDto object representing the status of the file
   */
  fileStatus = async (cid: string): Promise<StatusResponseDto> => {
    if (!cid) throw new BadRequestException(VALIDATE_CID_REQUIRED);

    const response = await firstValueFrom(
      this.httpService.post(
        `https://${this.domainNgRok}/api/v0/files/stat?arg=/ipfs/${cid}`,
      ),
    ).catch(handleHttpRequestError);

    return this.ipfsMapper.mapResponseToStatusResponseDto(response.data);
  };

  /**
   * Retrieves the content of a directory stored in IPFS using the provided folder CID.
   *
   * @param folderCid The Content Identifier (CID) of the folder in IPFS.
   * @returns A Promise resolving to a string representing the content of the directory.
   * @throws HttpException if an error occurs during the HTTP request.
   */
  contentDirectory = async (folderCid: string): Promise<string> => {
    const response = await firstValueFrom(
      this.httpService.post(
        `https://${this.domainNgRok}/api/v0/ls?arg=/ipfs/${folderCid}`,
      ),
    ).catch(handleHttpRequestError);
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
    ).catch(handleHttpRequestError);
  };

  /**
   * Uploads multiple files to IPFS.
   *
   * @param userId The ID of the user performing the upload.
   * @param files An array of files to be uploaded.
   * @param nameFolder The name of the folder where the files will be stored.
   * @returns A Promise resolving to an object representing the result of the IPFS upload.
   */
  uploadMutipleFiles = async (
    userId: number,
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

    const data = this.ipfsMapper.mapToAddIpfsDto(userId, response.data);

    const ipfs = await this.addIpfs(data);

    return ipfs;
  };

  async copyFileToMfs(transferFileDto: TransferIpfsFileDto): Promise<void> {
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

  addIpfs = async (addFileDto: AddFileIpfsDto): Promise<Ipfs> => {
    if (await this.checkExistCid(addFileDto.folderCid)) {
      throw new BadRequestException(ERROR_CID_ALREADY_EXIST);
    }

    const linkFile: string = getLinkIpfs(addFileDto.folderCid);

    const fileIpfs = await this.prismaService.ipfs.create({
      data: {
        userId: addFileDto.userId,
        name: addFileDto.fileName,
        folderCid: addFileDto.folderCid,
        sizeFolder: addFileDto.sizeFolder,
        linkIpfs: linkFile,
        quantityFile: addFileDto.quantityFile,
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

  getByCid = async (cid: string): Promise<Ipfs> => {
    if (!(await this.checkExistCid(cid))) {
      throw new BadRequestException(ERROR_CID_NOT_FOUND);
    }
    const ipfs = await this.prismaService.ipfs.findFirst({
      where: { folderCid: cid },
    });
    return ipfs;
  };
}
