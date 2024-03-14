import { IsString } from 'class-validator';

export class TransferDto {
  @IsString()
  transferFrom: string;

  @IsString()
  transferTo: string;

  amount: number;
}
