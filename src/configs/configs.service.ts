import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigsService {
  constructor(private readonly configService: ConfigService) {}

  public readonly infura = {
    projectId: this.configService.get('PROJECT_ID'),
    projectSecret: this.configService.get('PROJECT_SECRET'),
  };
}
