import { Injectable, NotFoundException } from '@nestjs/common';
import { Evidence } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { EvidenceStatus } from './enum/status';

@Injectable()
export class EvidencesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  createEvidence = () => {};
  pushEvidence = async (cid: string, signature: string) => {};

  getEvidences = async (): Promise<Evidence[]> => {
    const evidences = await this.prismaService.evidence.findMany();
    return evidences;
  };

  getEvidenceByUserId = async (userId: number): Promise<Evidence> => {
    const user = await this.userService.getUserById(userId);
    const evidence = await this.prismaService.evidence.findFirst({
      where: {
        userId: user.id,
      },
    });
    return evidence;
  };

  changeStatusEvidence = async (
    evidenceId: number,
    status: EvidenceStatus,
  ): Promise<boolean> => {
    const evidence = await this.getEvidenceByUserId(evidenceId);
    if (!evidence) {
      throw new NotFoundException('Evidence not found');
    }
    await this.prismaService.evidence.update({
      where: {
        id: evidence.id,
      },
      data: {
        status: status,
      },
    });
    return true;
  };
}
