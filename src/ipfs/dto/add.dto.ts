import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddFileIpfsDto {
  userId: number;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  folderCid: string;

  @IsOptional()
  sizeFolder?: number;

  quantityFile?: number;
}
