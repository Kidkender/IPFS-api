import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ConfigsModule } from './configs/configs.module';
import { HttpErrorInterceptor } from './configs/http.interceptor';
import { ContractsModule } from './contracts/contracts.module';
import { EvidencesModule } from './evidences/evidences.module';
import { IpfsModule } from './ipfs/ipfs.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    HttpModule,
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
    ContractsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpErrorInterceptor,
    },
  ],
})
export class AppModule {}
