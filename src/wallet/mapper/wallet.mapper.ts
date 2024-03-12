import { Injectable } from '@nestjs/common';
import { Wallets } from '@prisma/client';
import { WalletResponseDto } from '../dto/wallet.dto';

@Injectable()
export class WalletMapper {
  mapToWalletResponseDto(wallet: Wallets): WalletResponseDto {
    if (!wallet) {
      return;
    }
    const walletDto: WalletResponseDto = {
      id: wallet.id,
      userId: wallet.userId,
      address: wallet.address,
      phrase: wallet.phrase,
      balance: wallet.balance ? BigInt(wallet.balance.toString()) : 0,
      createdAt: wallet.createdAt,
    };
    return walletDto;
  }
}
