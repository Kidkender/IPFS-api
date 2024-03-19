import { Module } from '@nestjs/common';
import { TokenContractController } from './token.controller';
import { TokenService } from './token.service';
import { ContractsModule } from 'src/contracts/contracts.module';

@Module({
  imports: [ContractsModule],
  controllers: [TokenContractController],
  providers: [TokenService],
  exports: [],
})
export class TokenModule {}
