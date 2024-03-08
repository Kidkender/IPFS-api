import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { StatusResponseDto } from './dto/status.dto';

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  constructor(private readonly httpService: HttpService) {}

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
}
