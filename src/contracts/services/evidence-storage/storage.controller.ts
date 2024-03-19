import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { SubmitEvidenceDto } from 'src/contracts/dto/submit-evidence.dto';
import { StorageService } from './storage.service';

@Controller('contracts/storage')
export class StorageContractController {
  constructor(private readonly storageService: StorageService) {}

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  async submitEvidence(
    @GetUser('id') userId: number,
    @Body() evidence: SubmitEvidenceDto,
  ) {
    const response = await this.storageService.submitEvidence(userId, evidence);
    return response;
  }

  @Get('retrieve')
  @UseGuards(JwtAuthGuard)
  async retrieve(
    @GetUser('id') userId: number,
    @Query('cidFolder') cidFolder: string,
  ) {
    const response = await this.storageService.retriveEvidence(
      userId,
      cidFolder,
    );
    return response;
  }
}
