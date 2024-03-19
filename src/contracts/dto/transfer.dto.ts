import {
  IsEthereumAddress,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';
import {
  VALIDATE_ADDRESS_ETHEREUM_INVALID,
  VALIDATE_ADDRESS_TRANSFER_FROM_REQUIRED,
  VALIDATE_ADDRESS_TRANSFER_TO_REQUIRED,
} from 'constant';

export class TransferDto {
  @IsNotEmpty({ message: VALIDATE_ADDRESS_TRANSFER_FROM_REQUIRED })
  @IsEthereumAddress({ message: VALIDATE_ADDRESS_ETHEREUM_INVALID })
  transferFrom: string;

  @IsString({ message: VALIDATE_ADDRESS_TRANSFER_TO_REQUIRED })
  @IsEthereumAddress({ message: VALIDATE_ADDRESS_ETHEREUM_INVALID })
  transferTo: string;

  @IsInt({ message: 'Must be an integer' })
  @Min(0, { message: 'Must be a non-negative integer' })
  amount: number;
}
