import { Module } from '@nestjs/common';
import { FilesService } from './file.service';
import { HttpModule } from '@nestjs/axios';
import { FileController } from 'src/files/file.controller';
import { IpfsService } from 'src/ipfs/ipfs.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [FileController],
  providers: [FilesService, IpfsService],
})
export class FilesModule {}
