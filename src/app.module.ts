import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EvidencesModule } from './evidences/evidences.module';
import { FilesModule } from './files/files.module';
import { IpfsController } from './ipfs/ipfs.controller';
import { IpfsModule } from './ipfs/ipfs.module';
import { IpfsService } from './ipfs/ipfs.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { FilesService } from './files/file.service';
import { WalletModule } from './wallet/wallet.module';

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
    EvidencesModule,
    WalletModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
