import { Injectable, Logger } from '@nestjs/common';
import {
  EthersContract,
  EthersSigner,
  InjectContractProvider,
  InjectEthersProvider,
  InjectSignerProvider,
} from 'nestjs-ethers';

import { BaseProvider } from '@ethersproject/providers';
import { SIGNER_ADDRESS, TOKEN_ABI_JSON, TOKEN_ADDRESS } from 'constant';
import { BigNumber, Contract, Signer, VoidSigner, ethers } from 'ethers';
import { ConfigsService } from 'src/configs/configs.service';
import { convertToDecimal, getAbi } from 'utils';
import { GasPriceResponseDto, TransferDto } from './dto';
import { ContractMapper } from './mapper/contracts.mapper';

@Injectable()
export class ContractsService {
  constructor(
    @InjectContractProvider() private readonly ethersContract: EthersContract,
    @InjectEthersProvider() private readonly ethersProvider: BaseProvider,
    @InjectSignerProvider() private readonly signerProvider: EthersSigner,
    private readonly configsService: ConfigsService,
    private readonly contractMapper: ContractMapper,
  ) {}
  private readonly logger = new Logger(ContractsService.name);

  getVoidSigner = (signerAddress: string): VoidSigner => {
    const voidSigner = this.signerProvider.createVoidSigner(signerAddress);

    return voidSigner;
  };

  getSigner = (signerAddress: string): Signer => {
    try {
      const provider = this.configsService.getJsonRpc();

      const signer = provider.getSigner(
        '0xBBcA09216D5Acd45F98f3e15c0556B19Ea83f5da',
      );
      return signer;
    } catch (error) {
      console.error(error);
    }
  };

  callContract = async (): Promise<boolean> => {
    // const provider = await this.ethersProvider.getEtherPrice();
    const signer = this.getVoidSigner(SIGNER_ADDRESS);
    const abi = getAbi(TOKEN_ABI_JSON);
    const contract = this.ethersContract.create(TOKEN_ADDRESS, abi, signer);
    const balanceOf = await contract.balanceOf(SIGNER_ADDRESS);

    return true;
  };

  getContract = async (
    abiJson: string,
    contractAddress: string,
  ): Promise<Contract> => {
    const signer = this.getVoidSigner(SIGNER_ADDRESS);
    const abi = getAbi(abiJson);
    const contract = this.ethersContract.create(contractAddress, abi, signer);
    return contract;
  };

  getAmountToken = async (address: string): Promise<string | Number> => {
    const tokenContract = await this.getContract(TOKEN_ABI_JSON, TOKEN_ADDRESS);
    const balanceOf = await tokenContract.balanceOf(address);
    return ethers.utils.formatEther(balanceOf);
  };

  getVotes = async (address: string) => {
    const tokenContract = await this.getContract(TOKEN_ABI_JSON, TOKEN_ADDRESS);
    const votes = await tokenContract.getVotes(address);
    return votes;
  };

  getFeeData = async (): Promise<GasPriceResponseDto> => {
    const ethersProvider = this.ethersProvider;
    const feeData = await ethersProvider.getFeeData();

    const data = this.contractMapper.mapJsonFeeDataToGasPrice(feeData);
    return data;
  };

  estimateGas = async (transferDto: TransferDto): Promise<BigInt> => {
    try {
      const { transferFrom, transferTo, amount } = transferDto;
      const amountToWei = ethers.utils.parseEther(String(amount));

      const signer = new ethers.Wallet(
        '0d28cf7e47ba23b16b3e1a9d4a731de7e5b68747c148a9fcdf28e96b4b66e171',
        this.ethersProvider,
      );

      const tokenContract = await this.getContract(
        TOKEN_ABI_JSON,
        TOKEN_ADDRESS,
      );
      console.log(
        'balance of address from: ',
        convertToDecimal(await tokenContract.balanceOf(transferFrom)),
      );
      console.log('balance will transfer: ', convertToDecimal(amountToWei));
      const estimateGas = await tokenContract
        .connect(signer)
        .estimateGas.transferFrom(transferFrom, transferTo, amountToWei);
      return convertToDecimal(estimateGas);
    } catch (error) {
      console.error(error);
    }
  };

  transferToken = async (transferDto: TransferDto) => {
    const { transferFrom, transferTo, amount } = transferDto;

    try {
      const tokenContract = await this.getContract(
        TOKEN_ABI_JSON,
        TOKEN_ADDRESS,
      );
      const amoutToWei = ethers.utils.parseEther(String(amount));
      // const signer = this.getSigner(transferFrom);
      const signer = new ethers.Wallet(
        '0d28cf7e47ba23b16b3e1a9d4a731de7e5b68747c148a9fcdf28e96b4b66e171',
        this.ethersProvider,
      );
      const result = await tokenContract
        .connect(signer)
        .transfer(transferTo, amoutToWei);
      console.log('Result: ', result);
    } catch (error) {
      this.logger.error(error);
      console.log(error);
    }
  };
}
