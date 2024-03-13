import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { ConfigsModule } from 'src/configs/configs.module';

@Module({
  imports: [ConfigsModule],
  providers: [ContractsService],
  controllers: [ContractsController],
})
export class ContractsModule {}
