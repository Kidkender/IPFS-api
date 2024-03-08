import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { IpfsService } from './ipfs/ipfs.service';
import { IpfsController } from './ipfs/ipfs.controller';
import { IpfsModule } from './ipfs/ipfs.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    FilesModule,
    AuthModule,
    UserModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    IpfsModule,
  ],
  controllers: [IpfsController],
  providers: [IpfsService],
})
export class AppModule {}
