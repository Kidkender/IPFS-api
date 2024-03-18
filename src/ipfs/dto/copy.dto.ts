import { IsString } from 'class-validator';
import {
  VALIDATE_DESTINATION_CID_REQUIRED,
  VALIDATE_SOURCE_CID_REQUIRED,
} from 'constant';

export class TransferIpfsFileDto {
  @IsString({ message: VALIDATE_SOURCE_CID_REQUIRED })
  sourceCID: string;

  @IsString({ message: VALIDATE_DESTINATION_CID_REQUIRED })
  destination: string;
}
