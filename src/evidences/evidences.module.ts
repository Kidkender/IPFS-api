import { Module } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { EvidencesService } from './evidences.service';
import { UserMapper } from 'src/user/mappers/user.mapper';
import { EvidencesController } from './evidences.controller';

@Module({
  imports: [],
  providers: [EvidencesService, UserService, UserMapper],
  controllers: [EvidencesController],
})
export class EvidencesModule {}
