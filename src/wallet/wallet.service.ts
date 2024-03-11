import { BadRequestException, Injectable } from '@nestjs/common';
import { Wallet } from 'ethers';
import { EthersSigner, InjectSignerProvider } from 'nestjs-ethers';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectSignerProvider() private readonly etherSigner: EthersSigner,
    private readonly prismaService: PrismaService,
  ) {}

  generateWallet = async (): Promise<Wallet> => {
    const wallet: Wallet = this.etherSigner.createRandomWallet();
    console.log(wallet.provider);
    return wallet;
  };

  checkExistUserWallet = async (userId: number): Promise<boolean> => {
    const wallet = await this.prismaService.wallets.findUnique({
      where: {
        userId: userId,
      },
    });

    return !!wallet;
  };

  createWallet = async (userId: number) => {
    if (await this.checkExistUserWallet(userId)) {
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
}
