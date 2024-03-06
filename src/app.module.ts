import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [FilesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
