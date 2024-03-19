import { Module } from '@nestjs/common';
import { ConfigsModule } from 'src/configs/configs.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { ContractMapper } from './mapper/contracts.mapper';

@Module({
  imports: [ConfigsModule, WalletModule],
  providers: [ContractsService, ContractMapper],
  controllers: [ContractsController],
  exports: [ContractsService, ContractMapper],
})
export class ContractsModule {}
