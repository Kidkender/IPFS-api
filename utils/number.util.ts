import { BigNumber, ethers } from 'ethers';

export function convertToDecimal(hexValue: BigNumber | string): bigint {
  return BigNumber.from(hexValue).toBigInt();
}

export function convertToEther(value: number): BigNumber {
  return ethers.utils.parseEther(String(value));
}
