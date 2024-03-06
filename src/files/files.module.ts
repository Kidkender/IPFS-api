import { Module } from '@nestjs/common';
import { FilesService } from './file.service';
import { HttpModule } from '@nestjs/axios';
import { FileController } from 'src/files/file.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [FileController],
  providers: [FilesService],
})
export class FilesModule {}
