import { Module } from '@nestjs/common';
import { NetworksService } from './networks.service';
import { NetworksController } from './networks.controller';

@Module({
  providers: [NetworksService],
  controllers: [NetworksController]
})
export class NetworksModule {}
