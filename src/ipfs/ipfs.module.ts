import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigsModule } from 'src/configs/configs.module';
import { IpfsController } from './ipfs.controller';
import { IpfsService } from './ipfs.service';
import { IPFSMapper } from './mapper/ipfs.mapper';

@Module({
  imports: [HttpModule, ConfigsModule],
  controllers: [IpfsController],
  providers: [IpfsService, IPFSMapper],
})
export class IpfsModule {}
