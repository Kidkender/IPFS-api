import { Module } from '@nestjs/common';
import { FilesService } from '../services/file.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [FilesService],
})
export class FilesModule {}
