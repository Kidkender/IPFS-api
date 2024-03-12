import { ethers } from 'ethers';

const hashMessage = (message: string): string => {
  return ethers.utils.hashMessage(message);
};

export const generateSignature = async (
  message: string,
  privateKey: string,
): Promise<string> => {
  const wallet = new ethers.Wallet(privateKey);
  return await wallet.signMessage(message);
};

const verifyMessage = (message: string, signature: string): string => {
  return ethers.utils.verifyMessage(message, signature);
};

const callDataFunction = async (
  abi: string,
  nameFunction: string,
  value: any,
): Promise<string> => {
  const iface = new ethers.utils.Interface(abi);
  const data = iface.encodeFunctionData(nameFunction, [value]);
  return data;
};

export default {
  hashMessage,
  generateSignature,
  verifyMessage,
  callDataFunction,
};
