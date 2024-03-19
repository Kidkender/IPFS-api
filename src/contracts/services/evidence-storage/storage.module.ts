import { Module } from '@nestjs/common';
import { ContractsModule } from 'src/contracts/contracts.module';
import { StorageContractController } from './storage.controller';
import { StorageService } from './storage.service';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [ContractsModule, WalletModule],
  controllers: [StorageContractController],
  providers: [StorageService],
  exports: [],
})
export class StorageContractModule {}
