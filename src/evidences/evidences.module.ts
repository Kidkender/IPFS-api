import { Module } from '@nestjs/common';
import { EvidencesService } from './evidences.service';

@Module({
  providers: [EvidencesService]
})
export class EvidencesModule {}
