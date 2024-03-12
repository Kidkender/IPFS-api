import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { WalletMapper } from './mapper/wallet.mapper';

@Module({
  imports: [],
  providers: [WalletService, WalletMapper],
  controllers: [WalletController],
})
export class WalletModule {}
