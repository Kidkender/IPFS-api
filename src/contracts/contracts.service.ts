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
import { Contract, VoidSigner, ethers } from 'ethers';
import { ConfigsService } from 'src/configs/configs.service';
import { getAbi } from 'utils';

@Injectable()
export class ContractsService {
  constructor(
    @InjectContractProvider() private readonly ethersContract: EthersContract,
    @InjectEthersProvider() private readonly ethersProvider: BaseProvider,
    @InjectSignerProvider() private readonly signerProvider: EthersSigner,
    private readonly configsService: ConfigsService,
  ) {}
  private readonly logger = new Logger(ContractsService.name);

  getSigner = (signerAddress: string): VoidSigner => {
    const voidSigner = this.signerProvider.createVoidSigner(signerAddress);
    return voidSigner;
  };

  callContract = async (): Promise<boolean> => {
    // const provider = await this.ethersProvider.getEtherPrice();
    const signer = this.getSigner(SIGNER_ADDRESS);
    const abi = getAbi(TOKEN_ABI_JSON);
    const contract = this.ethersContract.create(TOKEN_ADDRESS, abi, signer);
    const balanceOf = await contract.balanceOf(SIGNER_ADDRESS);

    return true;
  };

  getTokenContract = async (): Promise<Contract> => {
    const signer = this.getSigner(SIGNER_ADDRESS);
    const abi = getAbi(TOKEN_ABI_JSON);
    const contract = this.ethersContract.create(TOKEN_ADDRESS, abi, signer);
    return contract;
  };

  getAmountToken = async (address: string): Promise<string | Number> => {
    const tokenContract = await this.getTokenContract();
    const balanceOf = await tokenContract.balanceOf(address);
    return ethers.utils.formatEther(balanceOf);
  };
}
