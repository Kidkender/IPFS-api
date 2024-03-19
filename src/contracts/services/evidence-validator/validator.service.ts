import { Injectable, Logger } from '@nestjs/common';
import {
  EVIDENCE_VALIDATOR_ABI_JSON,
  EVIDENCE_VALIDATOR_ADDRESS,
  SIGNER_ADDRESS,
} from 'constant';
import { Contract } from 'ethers';
import { ContractsService } from 'src/contracts/contracts.service';
import { SubmitEvidenceDto } from 'src/contracts/dto/submit-evidence.dto';
import { generateSignature, hashData } from 'utils';

@Injectable()
export class EvidenceValidatorService {
  constructor(private readonly contractService: ContractsService) {}

  private readonly logger = new Logger(EvidenceValidatorService.name);

  private async getEvidenceValidatorContract(): Promise<Contract> {
    return await this.contractService.getContract(
      EVIDENCE_VALIDATOR_ABI_JSON,
      EVIDENCE_VALIDATOR_ADDRESS,
      this.contractService.getVoidSigner(SIGNER_ADDRESS),
    );
  }

  /**
   * Checks whether evidences associated with a given CID Folder (IPFS) is valid.
   *
   * @param cid The CID of the evidence stored in IPFS.
   * @returns A promise resolving to boolean indicating whether the evidence stored in IPFS is valid
   */
  checkEvidenceValid = async (cid: string): Promise<boolean> => {
    const evidenceValidator = await this.getEvidenceValidatorContract();
    const hashEvidence = hashData(cid);
    const result =
      await evidenceValidator.callStatic.isEvidenceValid(hashEvidence);
    return result;
  };

  /**
   * Validates evidence submitted by a user.
   *
   * @param userId The ID of the user submitting the evidence.
   * @param request The SubmitEvidenceDto containing the details of the evidence to be validated.
   * @returns A Promise resolving to the validation result.
   */
  validateEvidence = async (userId: number, request: SubmitEvidenceDto) => {
    const evidenceValidator = await this.getEvidenceValidatorContract();
    const privateKey =
      await this.contractService.getPrivateKeyFromUserId(userId);

    const evidenceHash = hashData(request.cidFolder);
    const signature = await generateSignature(request.cidFolder, privateKey);
    const signer = this.contractService.getSigner(privateKey);

    const result = await evidenceValidator
      .connect(signer)
      .validateEvidence(evidenceHash, signature);

    this.logger.log('Validate evidence successfully');
    return result;
  };
}
