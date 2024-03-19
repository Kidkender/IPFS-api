import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { ConfigsModule } from 'src/configs/configs.module';
import { ContractMapper } from './mapper/contracts.mapper';
import { WalletModule } from 'src/wallet/wallet.module';
import { EvidencesModule } from 'src/evidences/evidences.module';

@Module({
  imports: [ConfigsModule],
  providers: [ContractsService, ContractMapper],
  controllers: [ContractsController],
  exports: [ContractsService, ContractMapper],
})
export class ContractsModule {}
