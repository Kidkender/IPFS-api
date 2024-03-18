import { Injectable } from '@nestjs/common';
import { AddFileIpfsDto, StatusResponseDto, UploadResponseDto } from '../dto';
import { convertToArray } from 'utils';

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

  mapToAddIpfsDto(userId: number, data: any): AddFileIpfsDto {
    const dataArray = convertToArray(data);
    const indexOfFolder = dataArray.length - 1;
    return {
      fileName: dataArray[indexOfFolder].Name,
      folderCid: dataArray[indexOfFolder].Hash,
      sizeFolder: parseFloat(dataArray[indexOfFolder].Size),
      userId: userId,
      quantityFile: indexOfFolder,
    };
  }
}
