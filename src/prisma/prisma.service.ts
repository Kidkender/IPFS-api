import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
    });
  }

  cleanDatabase() {
    this.$transaction([
      this.user.deleteMany(),
      this.transaction.deleteMany(),
      this.evidence.deleteMany(),
      this.ipfs.deleteMany(),
      this.wallet.deleteMany(),
    ]);
  }
}
