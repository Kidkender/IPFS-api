import { Injectable, Logger } from '@nestjs/common';
import {
  EVIDENCE_STORAGE_ABI_JSON,
  EVIDENCE_STORAGE_ADDRESS,
  SIGNER_ADDRESS,
} from 'constant';
import { Contract } from 'ethers';
import { ContractsService } from 'src/contracts/contracts.service';
import { RetrieveEvidenceDto } from 'src/contracts/dto';
import { SubmitEvidenceDto } from 'src/contracts/dto/submit-evidence.dto';
import { ContractMapper } from 'src/contracts/mapper/contracts.mapper';
import { WalletService } from 'src/wallet/wallet.service';
import { generateSignature, getPrivateKeyFromMnemonic, hashData } from 'utils';

@Injectable()
export class StorageService {
  constructor(
    private readonly contractService: ContractsService,
    private readonly walletService: WalletService,
    private readonly contractMapper: ContractMapper,
  ) {}
  private readonly logger = new Logger(StorageService.name);

  private async getEvidenceStorageContract(): Promise<Contract> {
    return await this.contractService.getContract(
      EVIDENCE_STORAGE_ABI_JSON,
      EVIDENCE_STORAGE_ADDRESS,
      this.contractService.getVoidSigner(SIGNER_ADDRESS),
    );
  }

  submitEvidence = async (
    userId: number,
    submitEvidence: SubmitEvidenceDto,
  ) => {
    const evidenceStorage = await this.getEvidenceStorageContract();
    const wallet = await this.walletService.getWalletByUserId(userId);

    const privateKey = getPrivateKeyFromMnemonic(wallet.phrase);

    const evidenceHash = hashData(submitEvidence.cidFolder);
    const signature = await generateSignature(
      submitEvidence.cidFolder,
      privateKey,
    );
    const signer = this.contractService.getSigner(privateKey);

    const result = await evidenceStorage
      .connect(signer)
      .submitEvidence(evidenceHash, signature);
    this.logger.log('submit evidence succeeded at: ', Date.now());

    return result;
  };

  retriveEvidence = async (
    userId: number,
    cid: string,
  ): Promise<RetrieveEvidenceDto> => {
    const evidenceStorage = await this.getEvidenceStorageContract();
    const evidenceHash = hashData(cid);

    console.log('Hello');
    const wallet = await this.walletService.getWalletByUserId(userId);

    const privateKey = getPrivateKeyFromMnemonic(wallet.phrase);

    const signer = this.contractService.getSigner(privateKey);

    const result = await evidenceStorage
      .connect(signer)
      .callStatic.evidences(evidenceHash);

    return this.contractMapper.mapDataToRetrieve(result);
  };
}
