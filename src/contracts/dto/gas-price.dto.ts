export class GasPriceResponseDto {
  gasPrice: bigint | string;

  lastBaseFeePerGas: bigint | string;

  maxFeePerGas: bigint | string;

  maxPriorityFeePerGas: bigint | string;
}
