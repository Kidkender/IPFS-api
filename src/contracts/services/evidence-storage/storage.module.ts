import { Module } from '@nestjs/common';
import { ContractsModule } from 'src/contracts/contracts.module';
import { StorageContractController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [ContractsModule],
  controllers: [StorageContractController],
  providers: [StorageService],
  exports: [],
})
export class StorageContractModule {}
