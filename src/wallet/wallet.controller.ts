import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createWallet(@GetUser('id') userId: number) {
    return await this.walletService.createWallet(userId);
  }

  @Get()
  async getWallets() {
    return await this.walletService.getWallets();
  }

  @Get('/address/:address')
  getAddressByAddress(@Param('address') address: string) {
    return this.walletService.getWalletByAddress(address);
  }

  @Get('id/:id')
  async getWalletByUserId(@Param('id', ParseIntPipe) id: number) {
    return await this.walletService.getWalletByUserId(id);
  }
}
