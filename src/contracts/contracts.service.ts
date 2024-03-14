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
import { convertToDecimal, getAbi } from 'utils';
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
  getVoidSigner = (signerAddress: string): VoidSigner => {
    return this.signerProvider.createVoidSigner(signerAddress);
  };

  getSigner = (privateKey: string): Wallet => {
    const signer = new ethers.Wallet(privateKey, this.ethersProvider);
    return signer;
  };

  getContract = async (
    abiJson: string,
    contractAddress: string,
    signer: VoidSigner,
  ): Promise<Contract> => {
    const abi = getAbi(abiJson);
    const contract = this.ethersContract.create(contractAddress, abi, signer);
    return contract;
  };

  getAmountToken = async (address: string): Promise<string | number> => {
    const tokenContract = await this.getContract(
      TOKEN_ABI_JSON,
      TOKEN_ADDRESS,
      this.getVoidSigner(SIGNER_ADDRESS),
    );
    const balanceOf = await tokenContract.balanceOf(address);
    return ethers.utils.formatEther(balanceOf);
  };

  getVotes = async (address: string) => {
    const tokenContract = await this.getContract(
      TOKEN_ABI_JSON,
      TOKEN_ADDRESS,
      this.getVoidSigner(SIGNER_ADDRESS),
    );
    const votes = await tokenContract.getVotes(address);
    return convertToDecimal(votes);
  };

  getFeeData = async (): Promise<GasPriceResponseDto> => {
    const ethersProvider = this.ethersProvider;
    const feeData = await ethersProvider.getFeeData();

    const data = this.contractMapper.mapJsonFeeDataToGasPrice(feeData);
    return data;
  };

  estimateGas = async (transferDto: TransferDto): Promise<bigint> => {
    try {
      const { transferFrom, transferTo, amount } = transferDto;
      const amountToWei = ethers.utils.parseEther(String(amount));

      const signer = this.getSigner(this.PRIVATE_KEY_OWNER);

      const tokenContract = await this.getContract(
        TOKEN_ABI_JSON,
        TOKEN_ADDRESS,
        this.getVoidSigner(SIGNER_ADDRESS),
      );

      const estimateGas = await tokenContract
        .connect(signer)
        .estimateGas.transferFrom(transferFrom, transferTo, amountToWei);
      return convertToDecimal(estimateGas);
    } catch (error) {
      console.error(error);
    }
  };

  getTotalSupply = async (): Promise<string> => {
    const tokenContract: Contract = await this.getContract(
      TOKEN_ABI_JSON,
      TOKEN_ADDRESS,
      this.getVoidSigner(SIGNER_ADDRESS),
    );

    return ethers.utils.formatEther(
      convertToDecimal(await tokenContract.totalSupply()),
    );
  };

  // Effect to amount token
  mintToken = async (amount: number) => {
    const tokenContract = await this.getContract(
      TOKEN_ABI_JSON,
      TOKEN_ADDRESS,
      this.getVoidSigner(SIGNER_ADDRESS),
    );
    const amountToWei = ethers.utils.parseEther(String(amount));
    const result = await tokenContract
      .connect(this.PRIVATE_KEY_OWNER)
      .mint(amountToWei);
    return result;
  };

  transferToken = async (transferDto: TransferDto) => {
    const { transferTo, amount } = transferDto;

    try {
      const tokenContract = await this.getContract(
        TOKEN_ABI_JSON,
        TOKEN_ADDRESS,
        this.getVoidSigner(SIGNER_ADDRESS),
      );
      const amoutToWei = ethers.utils.parseEther(String(amount));
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
