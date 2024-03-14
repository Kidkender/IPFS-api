import { BigNumber } from 'ethers';

export function convertToDecimal(hexValue: BigNumber | string): bigint {
  return BigNumber.from(hexValue).toBigInt();
}
