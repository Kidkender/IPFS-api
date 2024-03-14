import { Injectable } from '@nestjs/common';
import { convertToDecimal } from 'utils';
import { GasPriceResponseDto } from '../dto';

@Injectable()
export class ContractMapper {
  mapJsonFeeDataToGasPrice = (data: any): GasPriceResponseDto => {
    return {
      gasPrice: convertToDecimal(data.gasPrice._hex),
      lastBaseFeePerGas: convertToDecimal(data.lastBaseFeePerGas._hex),
      maxFeePerGas: convertToDecimal(data.maxFeePerGas._hex),
      maxPriorityFeePerGas: convertToDecimal(data.maxPriorityFeePerGas._hex),
    };
  };
}
