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
import { generateSignature, hashData } from 'utils';

@Injectable()
export class StorageService {
  constructor(
    private readonly contractService: ContractsService,
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

  /**
   * Submits evidence to the evidence storage contract on behalf of a user.
   *
   * @param userId The ID of the user submitting the evidence.
   * @param submitEvidence The SubmitEvidenceDto containing the details of the evidence to be submitted.
   * @returns A Promise resolving to the result of the evidence submission.
   */
  submitEvidence = async (
    userId: number,
    submitEvidence: SubmitEvidenceDto,
  ) => {
    const evidenceStorage = await this.getEvidenceStorageContract();

    const privateKey =
      await this.contractService.getPrivateKeyFromUserId(userId);

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

  /**
   * Retrieves evidence associated with a given CID for a specific user.
   *
   * @param userId The ID of the user retrieving the evidence.
   * @param cid The Content Identifier (CID) of the evidence to be retrieved.
   * @returns A Promise resolving to a RetrieveEvidenceDto object representing the retrieved evidence.
   */
  retriveEvidence = async (
    userId: number,
    cid: string,
  ): Promise<RetrieveEvidenceDto> => {
    const evidenceStorage = await this.getEvidenceStorageContract();
    const evidenceHash = hashData(cid);

    const privateKey =
      await this.contractService.getPrivateKeyFromUserId(userId);

    const signer = this.contractService.getSigner(privateKey);

    const result = await evidenceStorage
      .connect(signer)
      .callStatic.evidences(evidenceHash);

    return this.contractMapper.mapDataToRetrieve(result);
  };
}
