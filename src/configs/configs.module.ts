import { Module } from '@nestjs/common';
import { EthersModule, SEPOLIA_NETWORK } from 'nestjs-ethers';
import { ConfigsService } from './configs.service';
import { ErrorHandlingService } from './errors.service';

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
  providers: [ConfigsService, ErrorHandlingService],
  exports: [ConfigsService, ErrorHandlingService],
})
export class ConfigsModule {}
