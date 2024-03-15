import { Injectable } from '@nestjs/common';
import { UploadResponseDto } from '../dto/upload-reponse.dto';

@Injectable()
export class FileMapper {
  mapToUploadResponseDto(data: any): UploadResponseDto {
    return {
      name: data.Name,
      hash: data.Hash,
      size: data.Size,
    };
  }
}
