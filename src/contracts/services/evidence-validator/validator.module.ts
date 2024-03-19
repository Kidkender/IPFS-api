import { Module } from '@nestjs/common';
import { ContractsModule } from 'src/contracts/contracts.module';
import { ValidatorContractController } from './validator.controller';
import { EvidenceValidatorService } from './validator.service';

@Module({
  imports: [ContractsModule],
  controllers: [ValidatorContractController],
  providers: [EvidenceValidatorService],
  exports: [],
})
export class ValidatorContractModule {}
