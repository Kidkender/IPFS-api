import { Module } from '@nestjs/common';
import { EthersModule, SEPOLIA_NETWORK } from 'nestjs-ethers';
import { ConfigsService } from './configs.service';

@Module({
  imports: [
    EthersModule.forRootAsync({
      imports: [ConfigsModule],
      inject: [ConfigsService],
      useFactory: async (config: ConfigsService) => {
        // await somePromise();
        return {
          network: SEPOLIA_NETWORK,
          infura: config.infura,
          useDefaultProvider: true,
        };
      },
    }),
  ],
  providers: [ConfigsService],
  exports: [ConfigsService],
})
export class ConfigsModule {}
