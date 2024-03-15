import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FileController } from 'src/files/file.controller';
import { IpfsService } from 'src/ipfs/ipfs.service';
import { FilesService } from './file.service';
import { FileMapper } from './mapper/fileMapper';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [FileController],
  providers: [FilesService, FileMapper, IpfsService],
})
export class FilesModule {}
