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
import { Contract, VoidSigner, Wallet, ethers } from 'ethers';
import { getAbi } from 'utils';
import { GasPriceResponseDto } from './dto';
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

  public readonly PRIVATE_KEY_OWNER = this.configService.get(
    'PRIVATE_ADDRESS_OWNER',
  );

  public getVoidSigner = (signerAddress: string): VoidSigner => {
    return this.signerProvider.createVoidSigner(signerAddress);
  };

  public getSigner = (privateKey: string): Wallet => {
    return new ethers.Wallet(privateKey, this.ethersProvider);
  };

  public getContract = async (
    abiJson: string,
    contractAddress: string,
    signer: VoidSigner,
  ): Promise<Contract> => {
    const abi = getAbi(abiJson);
    return this.ethersContract.create(contractAddress, abi, signer);
  };

  async getFeeData(): Promise<GasPriceResponseDto> {
    const feeData = await this.ethersProvider.getFeeData();
    return this.contractMapper.mapJsonFeeDataToGasPrice(feeData);
  }
}
