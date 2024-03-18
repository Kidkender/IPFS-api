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
import { SIGNER_ADDRESS, TOKEN_ABI_JSON, TOKEN_ADDRESS } from 'constant';
import { Contract, VoidSigner, Wallet, ethers } from 'ethers';
import { convertToDecimal, convertToEther, getAbi } from 'utils';
import { GasPriceResponseDto, TransferDto } from './dto';
import { ContractMapper } from './mapper/contracts.mapper';

@Injectable()
export class ContractsService {
  constructor(
    @InjectContractProvider() private readonly ethersContract: EthersContract,
    @InjectEthersProvider() private readonly ethersProvider: BaseProvider,
    @InjectSignerProvider() private readonly signerProvider: EthersSigner,
    private readonly configService: ConfigService,
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
   * @returns voidSigner
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
      console.log(error);
    }
  };
}
