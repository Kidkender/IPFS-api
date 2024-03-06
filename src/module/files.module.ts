import { Module } from '@nestjs/common';
import { FilesService } from '../services/file.service';
import { HttpModule } from '@nestjs/axios';
import { FileController } from 'src/controllers/file.controller';

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
