import fs from 'fs';
import * as ipfsOnlyHash from 'ipfs-only-hash';

const calculateHash = async (fileBytes: Buffer): Promise<string> => {
  try {
    const fileData = fs.readFileSync(fileBytes);
    const cidHash = await ipfsOnlyHash.of(fileData);
    return cidHash;
  } catch (error) {
    console.log('Error calculating hash ', error);
  }
};

export default {
  calculateHash,
};
