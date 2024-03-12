import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ConfigsModule } from './configs/configs.module';
import { EvidencesModule } from './evidences/evidences.module';
import { FilesModule } from './files/files.module';
import { IpfsModule } from './ipfs/ipfs.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
import { NetworksModule } from './networks/networks.module';

@Module({
  imports: [
    HttpModule,
    FilesModule,
    AuthModule,
    UserModule,
    PrismaModule,
    IpfsModule,
    EvidencesModule,
    WalletModule,
    ConfigsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    NetworksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
