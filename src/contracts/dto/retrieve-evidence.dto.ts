import { Bytes } from 'ethers';

export class RetrieveEvidenceDto {
  address: string;
  timestampt: number;
  signature: Bytes;
}
