import { Controller, Post, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post('create-wallet')
  @UseGuards(JwtAuthGuard)
  async createWallet(@GetUser('id') userId: number) {
    return await this.walletService.createWallet(userId);
  }
}
