import { Injectable, Logger } from '@nestjs/common';
import {
  EVIDENCE_VALIDATOR_ABI_JSON,
  EVIDENCE_VALIDATOR_ADDRESS,
  SIGNER_ADDRESS,
} from 'constant';
import { Contract } from 'ethers';
import { ContractsService } from 'src/contracts/contracts.service';
import { SubmitEvidenceDto } from 'src/contracts/dto/submit-evidence.dto';
import { WalletService } from 'src/wallet/wallet.service';
import { generateSignature, getPrivateKeyFromMnemonic, hashData } from 'utils';

@Injectable()
export class EvidenceValidatorService {
  constructor(
    private readonly contractService: ContractsService,
    private readonly walletService: WalletService,
  ) {}

  private readonly logger = new Logger(EvidenceValidatorService.name);

  private async getEvidenceValidatorContract(): Promise<Contract> {
    return await this.contractService.getContract(
      EVIDENCE_VALIDATOR_ABI_JSON,
      EVIDENCE_VALIDATOR_ADDRESS,
      this.contractService.getVoidSigner(SIGNER_ADDRESS),
    );
  }

  checkEvidenceValid = async (cid: string): Promise<boolean> => {
    const evidenceValidator = await this.getEvidenceValidatorContract();
    const hashEvidence = hashData(cid);
    const result =
      await evidenceValidator.callStatic.isEvidenceValid(hashEvidence);
    return result;
  };

  validateEvidence = async (userId: number, request: SubmitEvidenceDto) => {
    const evidenceValidator = await this.getEvidenceValidatorContract();
    const wallet = await this.walletService.getWalletByUserId(userId);

    const privateKey = getPrivateKeyFromMnemonic(wallet.phrase);

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
