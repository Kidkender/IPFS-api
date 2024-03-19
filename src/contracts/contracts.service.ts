import { Injectable, Logger } from '@nestjs/common';
import {
  EthersContract,
  EthersSigner,
  InjectContractProvider,
  InjectEthersProvider,
  InjectSignerProvider,
} from 'nestjs-ethers';

import { BaseProvider } from '@ethersproject/providers';
import { ConfigService } from '@nestjs/config';
import {
  EVIDENCE_STORAGE_ABI_JSON,
  EVIDENCE_STORAGE_ADDRESS,
  EVIDENCE_VALIDATOR_ABI_JSON,
  EVIDENCE_VALIDATOR_ADDRESS,
  SIGNER_ADDRESS,
  TOKEN_ABI_JSON,
  TOKEN_ADDRESS,
} from 'constant';
import { Contract, VoidSigner, Wallet, ethers } from 'ethers';
import { EvidencesService } from 'src/evidences/evidences.service';
import { WalletService } from 'src/wallet/wallet.service';
import {
  convertToDecimal,
  convertToEther,
  generateSignature,
  getAbi,
  getPrivateKeyFromMnemonic,
  hashData,
} from 'utils';
import { GasPriceResponseDto, RetrieveEvidenceDto, TransferDto } from './dto';
import { SubmitEvidenceDto } from './dto/submit-evidence.dto';
import { ContractMapper } from './mapper/contracts.mapper';

@Injectable()
export class ContractsService {
  constructor(
    @InjectContractProvider() private readonly ethersContract: EthersContract,
    @InjectEthersProvider() private readonly ethersProvider: BaseProvider,
    @InjectSignerProvider() private readonly signerProvider: EthersSigner,
    private readonly configService: ConfigService,
    private readonly walletService: WalletService,
    private readonly evidenceService: EvidencesService,
    private readonly contractMapper: ContractMapper,
  ) {}
  private readonly logger = new Logger(ContractsService.name);

  private readonly PRIVATE_KEY_OWNER = this.configService.get(
    'PRIVATE_ADDRESS_OWNER',
  );

  private getVoidSigner = (signerAddress: string): VoidSigner => {
    return this.signerProvider.createVoidSigner(signerAddress);
  };

  private getSigner = (privateKey: string): Wallet => {
    return new ethers.Wallet(privateKey, this.ethersProvider);
  };

  private getContract = async (
    abiJson: string,
    contractAddress: string,
    signer: VoidSigner,
  ): Promise<Contract> => {
    const abi = getAbi(abiJson);
    return this.ethersContract.create(contractAddress, abi, signer);
  };

  /**
   *
   * Get the contract instance for the token contract.
   * This method retrieves the contract instance for interacting with the token contract on the blockchain.
   * @returns A promise that resolves to the contract instance for the token contract.
   */
  private async getTokenContract(): Promise<Contract> {
    return await this.getContract(
      TOKEN_ABI_JSON,
      TOKEN_ADDRESS,
      this.getVoidSigner(SIGNER_ADDRESS),
    );
  }

  /**
   *
   * @param address address to get token balance
   * @returns amount token of address (string)
   */
  getBalance = async (address: string): Promise<string | number> => {
    const tokenContract = await this.getTokenContract();
    const balanceOf = await tokenContract.callStatic.balanceOf(address);
    return ethers.utils.formatEther(balanceOf);
  };

  /**
   *
   * @param address address to get quantity vote
   * @returns quantity vote
   */
  getVotes = async (address: string) => {
    const tokenContract = await this.getTokenContract();
    const votes = await tokenContract.callStatic.getVotes(address);
    return convertToDecimal(votes);
  };

  getRewardTokenAmount = async () => {
    const tokenContract = await this.getTokenContract();
    const result = await tokenContract.callStatic.rewardTokenAmount();
    return convertToDecimal(result);
  };

  async getFeeData(): Promise<GasPriceResponseDto> {
    const feeData = await this.ethersProvider.getFeeData();
    return this.contractMapper.mapJsonFeeDataToGasPrice(feeData);
  }

  /**
   *
   * Estimate the gas required for a token transfer.
   * @param transferDto An object containing information about the transfer, including the sender's address, recipient's address, and the amount of tokens to transfer.
   * @returns A promise that resolves to the estimated gas required for the token transfer.
   * @throws An error if the estimation fails.
   */
  estimateGas = async (transferDto: TransferDto): Promise<bigint> => {
    const { transferFrom, transferTo, amount } = transferDto;
    const amountToWei = convertToEther(amount);

    const signer = this.getSigner(this.PRIVATE_KEY_OWNER);

    const tokenContract = await this.getTokenContract();

    const estimateGas = await tokenContract
      .connect(signer)
      .estimateGas.transferFrom(transferFrom, transferTo, amountToWei);
    return convertToDecimal(estimateGas);
  };

  getTotalSupply = async (): Promise<string> => {
    const tokenContract = await this.getTokenContract();

    return ethers.utils.formatEther(
      convertToDecimal(await tokenContract.callStatic.totalSupply()),
    );
  };

  getTransactionTaxRate = async () => {
    const tokenContract = await this.getTokenContract();
    const result = await tokenContract.callStatic.transactionTaxRate();
    return convertToDecimal(result);
  };

  // Effect delegate

  /**
   *
   * @param address The address needs to be assigned a delegate
   * @returns payload of EVM (hash, data, transaction,...vv)
   */
  async delegate(address: string) {
    const tokenContract = await this.getTokenContract();
    const signer = this.getSigner(this.PRIVATE_KEY_OWNER);
    const result = await tokenContract.connect(signer).delegate(address);
    this.logger.log(`Delegate for address ${address} successfully`);
    return result;
  }

  // Effect to amount token

  /**
   *
   * @param amount quantity token need to mint
   * @returns payload of EVM (hash, data, transaction,...vv)
   */
  mintToken = async (amount: number) => {
    const tokenContract = await this.getTokenContract();

    const amountToWei = convertToEther(amount);
    const signer = this.getSigner(this.PRIVATE_KEY_OWNER);

    const result = await tokenContract
      .connect(signer)
      .mint(SIGNER_ADDRESS, amountToWei);

    this.logger.log('Mint token successfully, mint amount: ' + amount);
    return result;
  };

  /**
   *
   * @param amount quantity token need to mint
   * @returns payload of EVM (hash, data, transaction,...vv)
   */
  burnToken = async (amount: number) => {
    const tokenContract = await this.getTokenContract();

    const amountToWei = convertToEther(amount);
    const signer = this.getSigner(this.PRIVATE_KEY_OWNER);

    const result = await tokenContract.connect(signer).burn(amountToWei);

    this.logger.log('Burn token successfully, burn amount: ' + amount);
    return result;
  };

  setAmountTokenForReward = async (amount: number) => {
    const valueInWei = convertToEther(amount);
    const tokenContract = await this.getTokenContract();

    const signer = this.getSigner(this.PRIVATE_KEY_OWNER);
    const result = await tokenContract
      .connect(signer)
      .setRewardTokenAmount(valueInWei);
    this.logger.log(
      `Set new reward token amount: ${amount} token successfully`,
    );

    return result;
  };

  /**
   *
   * Transfer tokens from one address to another.
   * @param transferDto An object containing information about the transfer, including the sender's address, recipient's address, and the amount of tokens to transfer.
   * @returns A promise that resolves to the result of the token transfer transaction.
   * @throws An error if the token transfer fails.
   */
  transferToken = async (transferDto: TransferDto) => {
    const { transferTo, amount } = transferDto;

    try {
      const tokenContract = await this.getTokenContract();

      const amoutToWei = convertToEther(amount);
      const signer = this.getSigner(this.PRIVATE_KEY_OWNER);

      const result = await tokenContract
        .connect(signer)
        .transfer(transferTo, amoutToWei);
      return result;
    } catch (error) {
      this.logger.error(error);
    }
  };

  // Contract evidence

  private async getEvidenceStorageContract(): Promise<Contract> {
    return await this.getContract(
      EVIDENCE_STORAGE_ABI_JSON,
      EVIDENCE_STORAGE_ADDRESS,
      this.getVoidSigner(SIGNER_ADDRESS),
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
    const signer = this.getSigner(privateKey);

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

    const wallet = await this.walletService.getWalletByUserId(userId);

    const privateKey = getPrivateKeyFromMnemonic(wallet.phrase);

    const signer = this.getSigner(privateKey);

    const result = await evidenceStorage
      .connect(signer)
      .callStatic.evidences(evidenceHash);

    return this.contractMapper.mapDataToRetrieve(result);
  };

  // Evidence validator contract

  private async getEvidenceValidatorContract(): Promise<Contract> {
    return await this.getContract(
      EVIDENCE_VALIDATOR_ABI_JSON,
      EVIDENCE_VALIDATOR_ADDRESS,
      this.getVoidSigner(SIGNER_ADDRESS),
    );
  }

  checkEvidenceValid = async (cid: string): Promise<boolean> => {
    const evidenceValidator = await this.getEvidenceValidatorContract();
    const hashEvidence = hashData(cid);
    const result =
      await evidenceValidator.callStatic.isEvidenceValid(hashEvidence);
    console.log(result);
    return result;
  };

  validateEvidence = async (userId: number, request: SubmitEvidenceDto) => {
    const evidenceValidator = await this.getEvidenceValidatorContract();
    const wallet = await this.walletService.getWalletByUserId(userId);

    const privateKey = getPrivateKeyFromMnemonic(wallet.phrase);

    const evidenceHash = hashData(request.cidFolder);
    const signature = await generateSignature(request.cidFolder, privateKey);
    const signer = this.getSigner(privateKey);

    const result = await evidenceValidator
      .connect(signer)
      .validateEvidence(evidenceHash, signature);

    console.log(result);
    this.logger.log('Validate evidence successfully');
    return result;
  };
}
