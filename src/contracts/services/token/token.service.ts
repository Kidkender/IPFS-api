import { Injectable, Logger } from '@nestjs/common';
import { SIGNER_ADDRESS, TOKEN_ABI_JSON, TOKEN_ADDRESS } from 'constant';
import { Contract, ethers } from 'ethers';
import { ContractsService } from 'src/contracts/contracts.service';
import { TransferDto } from 'src/contracts/dto';
import { convertToDecimal, convertToEther } from 'utils';

@Injectable()
export class TokenService {
  constructor(private readonly contractService: ContractsService) {}

  private readonly logger = new Logger(TokenService.name);

  /**
   *
   * Get the contract instance for the token contract.
   * This method retrieves the contract instance for interacting with the token contract on the blockchain.
   * @returns A promise that resolves to the contract instance for the token contract.
   */
  private async getTokenContract(): Promise<Contract> {
    return await this.contractService.getContract(
      TOKEN_ABI_JSON,
      TOKEN_ADDRESS,
      this.contractService.getVoidSigner(SIGNER_ADDRESS),
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

    const signer = this.contractService.getSigner(
      this.contractService.PRIVATE_KEY_OWNER,
    );

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
    const signer = this.contractService.getSigner(
      this.contractService.PRIVATE_KEY_OWNER,
    );
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
    const signer = this.contractService.getSigner(
      this.contractService.PRIVATE_KEY_OWNER,
    );
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
    const signer = this.contractService.getSigner(
      this.contractService.PRIVATE_KEY_OWNER,
    );

    const result = await tokenContract.connect(signer).burn(amountToWei);

    this.logger.log('Burn token successfully, burn amount: ' + amount);
    return result;
  };

  setAmountTokenForReward = async (amount: number) => {
    const valueInWei = convertToEther(amount);
    const tokenContract = await this.getTokenContract();

    const signer = this.contractService.getSigner(
      this.contractService.PRIVATE_KEY_OWNER,
    );
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
      const signer = this.contractService.getSigner(
        this.contractService.PRIVATE_KEY_OWNER,
      );

      const result = await tokenContract
        .connect(signer)
        .transfer(transferTo, amoutToWei);
      return result;
    } catch (error) {
      this.logger.error(error);
    }
  };
}
