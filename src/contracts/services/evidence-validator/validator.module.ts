import { Module } from '@nestjs/common';
import { ValidatorContractController } from './validator.controller';
import { EvidenceValidatorService } from './validator.service';
import { ContractsModule } from 'src/contracts/contracts.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [ContractsModule, WalletModule],
  controllers: [ValidatorContractController],
  providers: [EvidenceValidatorService],
  exports: [],
})
export class ValidatorContractModule {}
