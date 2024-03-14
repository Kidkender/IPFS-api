import { BigNumber } from 'ethers';

export class GasPriceResponseDto {
  gasPrice: BigInt | Number;

  lastBaseFeePerGas: BigInt | Number;

  maxFeePerGas: BigInt | Number;

  maxPriorityFeePerGas: BigInt | Number;
}
