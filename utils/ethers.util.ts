import { ethers } from 'ethers';
import * as fs from 'fs';

export const hashData = (message: string): string => {
  return ethers.utils.hashMessage(message);
};

export const generateSignature = async (
  message: string,
  privateKey: string,
): Promise<string> => {
  const wallet = new ethers.Wallet(privateKey);
  return await wallet.signMessage(message);
};

export const verifyMessage = (message: string, signature: string): string => {
  return ethers.utils.verifyMessage(message, signature);
};

export const callDataFunction = async (
  abi: string,
  nameFunction: string,
  value: any,
): Promise<string> => {
  const iface = new ethers.utils.Interface(abi);
  const data = iface.encodeFunctionData(nameFunction, [value]);
  return data;
};

export const getAbi = (pathFile: string) => {
  var parsed = JSON.parse(
    fs.readFileSync(`utils/abi/${pathFile}.json`, 'utf8'),
  );
  return parsed.abi;
};

export const getPrivateKeyFromMnemonic = (mnemonic: string): string => {
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  return wallet.privateKey;
};
