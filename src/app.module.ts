import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [FilesModule, AuthModule, UserModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
