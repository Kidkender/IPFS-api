import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SEPOLIA_JSON } from 'constants/http';
import { ethers } from 'ethers';

@Injectable()
export class ConfigsService {
  constructor(private readonly configService: ConfigService) {}

  public readonly infura = {
    projectId: this.configService.get('PROJECT_ID'),
    projectSecret: this.configService.get('PROJECT_SECRET'),
  };

  provider = new ethers.providers.JsonRpcProvider(
    `${SEPOLIA_JSON + this.configService.get('PROJECT_SECRET')}`,
  );
}
