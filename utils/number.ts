import { BigNumber } from 'ethers';

export function convertToDecimal(hexValue: BigNumber | string): BigInt {
  return BigNumber.from(hexValue).toBigInt();
}
