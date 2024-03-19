import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ERROR_WALLET_ALREADY_EXIST, ERROR_WALLET_NOT_FOUND } from 'constant';
import { Wallet } from 'ethers';
import { EthersSigner, InjectSignerProvider } from 'nestjs-ethers';
import { PrismaService } from 'src/prisma/prisma.service';
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

  private generateWallet = async (): Promise<Wallet> => {
    const wallet: Wallet = this.etherSigner.createRandomWallet();
    return wallet;
  };

  checkExistWallet = async (userId: number): Promise<boolean> => {
    const count = await this.prismaService.wallets.count({
      where: { userId: userId },
    });

    return count > 0;
  };

  createWallet = async (userId: number) => {
    if (await this.checkExistWallet(userId)) {
      throw new BadRequestException(ERROR_WALLET_ALREADY_EXIST);
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
    this.logger.log(
      `Create wallet for user ${(await wallet).userId}  successfully`,
    );
    return wallet;
  };

  getWallets = async (): Promise<WalletResponseDto[]> => {
    return (await this.prismaService.wallets.findMany()).map((wallet) =>
      this.walletMapper.mapToWalletResponseDto(wallet),
    );
  };

  getWalletByUserId = async (userId: number): Promise<WalletResponseDto> => {
    const wallet = await this.prismaService.wallets.findUnique({
      where: {
        userId: userId,
      },
    });
    if (!wallet) {
      throw new BadRequestException(ERROR_WALLET_NOT_FOUND);
    }

    return this.walletMapper.mapToWalletResponseDto(wallet);
  };

  getWalletByAddress = async (address: string): Promise<WalletResponseDto> => {
    const wallet = await this.prismaService.wallets.findUnique({
      where: { address: address },
    });
    return this.walletMapper.mapToWalletResponseDto(wallet);
  };
}
