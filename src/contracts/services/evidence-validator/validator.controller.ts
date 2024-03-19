import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { SubmitEvidenceDto } from 'src/contracts/dto/submit-evidence.dto';
import { EvidenceValidatorService } from './validator.service';

@Controller('contracts/validator')
export class ValidatorContractController {
  constructor(private readonly validatorService: EvidenceValidatorService) {}

  @Get('valid')
  async checkEvidenceValid(@Query('cidFolder') cidFolder: string) {
    const response = await this.validatorService.checkEvidenceValid(cidFolder);
    return response;
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  async validateEvidence(
    @GetUser('id') userId: number,
    @Body() evidence: SubmitEvidenceDto,
  ) {
    const response = await this.validatorService.validateEvidence(
      userId,
      evidence,
    );
    return response;
  }
}
