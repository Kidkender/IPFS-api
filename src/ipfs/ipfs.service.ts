import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { getLinkIpfs } from 'helpers';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

import { Ipfs } from '@prisma/client';
import { AddFileIpfsDto, StatusResponseDto } from './dto';

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  constructor(
    private prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async fileStatus(cid: string): Promise<StatusResponseDto> {
    if (!cid) throw new BadRequestException('cid is required');

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://morally-immune-blowfish.ngrok-free.app/api/v0/files/stat?arg=/ipfs/${cid}`,
        ),
      );
      const { Hash, Size, CumulativeSize, Type } = response.data;

      const retriveDto = new StatusResponseDto();
      retriveDto.cid = Hash;
      retriveDto.size = Size;
      retriveDto.type = Type;
      retriveDto.cumulativeSize = CumulativeSize;

      this.logger.log(retriveDto);
      return retriveDto;
    } catch (error) {
      console.log(error);
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
      console.log(error);
      throw new Error(error.message);
    }
  };

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
