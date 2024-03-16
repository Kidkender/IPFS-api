import { Injectable } from '@nestjs/common';
import { StatusResponseDto, UploadResponseDto } from '../dto';

@Injectable()
export class IPFSMapper {
  mapResponseToStatusResponseDto(data: any): StatusResponseDto {
    const { Hash, Size, CumulativeSize, Type } = data;

    return {
      cid: Hash,
      size: Size,
      type: Type,
      cumulativeSize: CumulativeSize,
    };
  }

  mapToUploadResponseDto(data: any): UploadResponseDto[] {
    const dataArray = data
      .trim()
      .split('\n')
      .map((entry) => JSON.parse(entry));

    return dataArray.map((item: any) => {
      const uploadResponseDto = new UploadResponseDto();
      uploadResponseDto.name = item.Name;
      uploadResponseDto.hash = item.Hash;
      uploadResponseDto.size = item.Size;
      return uploadResponseDto;
    });
  }
}
