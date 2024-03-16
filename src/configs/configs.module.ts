import { Module } from '@nestjs/common';
import { EthersModule, SEPOLIA_NETWORK } from 'nestjs-ethers';
import { ConfigsService } from './configs.service';
import { HttpErrorInterceptor } from './http.interceptor';

@Module({
  imports: [
    EthersModule.forRootAsync({
      imports: [ConfigsModule],
      inject: [ConfigsService],
      useFactory: async (config: ConfigsService) => {
        return {
          network: SEPOLIA_NETWORK,
          infura: config.infura,
          useDefaultProvider: true,
        };
      },
    }),
  ],
  providers: [ConfigsService, HttpErrorInterceptor],
  exports: [ConfigsService, HttpErrorInterceptor],
})
export class ConfigsModule {}
