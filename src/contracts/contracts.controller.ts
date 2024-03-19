import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { GasPriceResponseDto, TransferDto } from './dto';
import { SubmitEvidenceDto } from './dto/submit-evidence.dto';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractService: ContractsService) {}

  @Get('balance')
  getBalance(@Query('address') address: string) {
    return this.contractService.getBalance(address);
  }

  @Get('votes')
  getVotes(@Query('address') address: string) {
    return this.contractService.getVotes(address);
  }

  @Get('feeData')
  async getFeeData(): Promise<GasPriceResponseDto> {
    return await this.contractService.getFeeData();
  }

  @Post('transfer')
  async transferToken(@Body() transferDto: TransferDto) {
    return await this.contractService.transferToken(transferDto);
  }

  @Get('estimate-gas')
  estimateGas(@Body() transferDto: TransferDto) {
    return this.contractService.estimateGas(transferDto);
  }

  @Get('total-supply')
  getTotalSupply() {
    return this.contractService.getTotalSupply();
  }

  @Get('token/reward-amount')
  getRewardTokenAmount() {
    return this.contractService.getRewardTokenAmount();
  }

  @Get('token/tax-rate')
  getTxTaxRate() {
    return this.contractService.getTransactionTaxRate();
  }

  @Post('token/mint')
  async mintToken(@Query('amount', ParseIntPipe) amount: number) {
    const response = await this.contractService.mintToken(amount);
    return response;
  }

  @Post('token/burn')
  async burnToken(@Query('amount', ParseIntPipe) amount: number) {
    const response = await this.contractService.burnToken(amount);
    return response;
  }

  @Post('delegate')
  async delegate(@Query('address') address: string) {
    const response = await this.contractService.delegate(address);
    return response;
  }

  @Post('evidence/submit')
  @UseGuards(JwtAuthGuard)
  async submitEvidence(
    @GetUser('id') userId: number,
    @Body() evidence: SubmitEvidenceDto,
  ) {
    const response = await this.contractService.submitEvidence(
      userId,
      evidence,
    );
    return response;
  }

  @Get('evidence/retrieve')
  @UseGuards(JwtAuthGuard)
  async retrieve(
    @GetUser('id') userId: number,
    @Query('cidFolder') cidFolder: string,
  ) {
    const response = await this.contractService.retriveEvidence(
      userId,
      cidFolder,
    );
    return response;
  }

  @Get('evidence/valid')
  async checkEvidenceValid(@Query('cidFolder') cidFolder: string) {
    const response = await this.contractService.checkEvidenceValid(cidFolder);
    return response;
  }

  @Post('evidence/validate')
  @UseGuards(JwtAuthGuard)
  async validateEvidence(
    @GetUser('id') userId: number,
    @Body() evidence: SubmitEvidenceDto,
  ) {
    const response = await this.contractService.validateEvidence(
      userId,
      evidence,
    );
    return response;
  }
}
