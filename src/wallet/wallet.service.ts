import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BigNumber, Wallet } from 'ethers';
import { EthersSigner, InjectSignerProvider } from 'nestjs-ethers';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateSignature } from 'utils';
import { WalletResponseDto } from './dto/wallet.dto';
import { WalletMapper } from './mapper/wallet.mapper';

@Injectable()
export class WalletService {
  constructor(
    @InjectSignerProvider() private readonly etherSigner: EthersSigner,
    private readonly prismaService: PrismaService,
    private readonly walletMapper: WalletMapper,
  ) {}

  private readonly logger = new Logger(WalletService.name);

  generateWallet = async (): Promise<Wallet> => {
    const wallet: Wallet = this.etherSigner.createRandomWallet();
    console.log(wallet.provider);
    return wallet;
  };

  getWalletByUserId = async (userId: number): Promise<WalletResponseDto> => {
    const wallet = await this.prismaService.wallets.findUnique({
      where: {
        userId: userId,
      },
    });

    return this.walletMapper.mapToWalletResponseDto(wallet);
  };

  createWallet = async (userId: number) => {
    if (await this.getWalletByUserId(userId)) {
      throw new BadRequestException('wallet exist');
    }
    const newWallet = await this.generateWallet();
    const wallet = this.prismaService.wallets.create({
      data: {
        address: newWallet.address,
        privateKey: newWallet.privateKey,
        userId: userId,
        balance: 0,
        phrase: newWallet._mnemonic().phrase,
        publicKey: newWallet.publicKey,
      },
      select: {
        userId: true,
        address: true,
      },
    });
    return wallet;
  };

  getWallets = async (): Promise<WalletResponseDto[]> => {
    return (await this.prismaService.wallets.findMany()).map((wallet) =>
      this.walletMapper.mapToWalletResponseDto(wallet),
    );
  };

  getWalletByAddress = async (address: string): Promise<WalletResponseDto> => {
    const wallet = await this.prismaService.wallets.findUnique({
      where: { address: address },
    });
    return this.walletMapper.mapToWalletResponseDto(wallet);
  };

  getSigner = async (userId: number): Promise<Wallet> => {
    const wallet = await this.getWalletByUserId(userId);

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    return this.etherSigner.createWalletfromMnemonic(wallet.phrase);
  };

  getBalance = async (userId: number): Promise<number | BigNumber> => {
    const signer = await this.getSigner(userId);
    const balance = await signer.getBalance();
    return balance.toNumber();
  };

  createSignature = async (
    userId: number,
    message: string,
  ): Promise<string> => {
    const signer = await this.getSigner(userId);
    const signature = await generateSignature(message, signer.privateKey);

    return signature;
  };
}
