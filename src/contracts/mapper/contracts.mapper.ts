import { Injectable } from '@nestjs/common';
import { convertToDecimal } from 'utils';
import { GasPriceResponseDto, RetrieveEvidenceDto } from '../dto';

@Injectable()
export class ContractMapper {
  mapJsonFeeDataToGasPrice = (data: any): GasPriceResponseDto => {
    return {
      gasPrice: convertToDecimal(data.gasPrice).toString(),
      lastBaseFeePerGas: convertToDecimal(data.lastBaseFeePerGas).toString(),
      maxFeePerGas: convertToDecimal(data.maxFeePerGas).toString(),
      maxPriorityFeePerGas: convertToDecimal(
        data.maxPriorityFeePerGas,
      ).toString(),
    };
  };

  mapDataToRetrieve = (data: any): RetrieveEvidenceDto => {
    return {
      address: data[0],
      timestampt: Number(data[1]),
      signature: data[2],
    };
  };
}
