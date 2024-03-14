import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { ConfigsModule } from 'src/configs/configs.module';
import { ContractMapper } from './mapper/contracts.mapper';

@Module({
  imports: [ConfigsModule],
  providers: [ContractsService, ContractMapper],
  controllers: [ContractsController],
})
export class ContractsModule {}
