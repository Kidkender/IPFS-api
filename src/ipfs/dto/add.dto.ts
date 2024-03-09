import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddFileIpfsDto {
  @IsString()
  @IsNotEmpty()
  folderCid: string;

  @IsOptional()
  evidenceId?: number;

  @IsOptional()
  sizeFolder?: number;
}
