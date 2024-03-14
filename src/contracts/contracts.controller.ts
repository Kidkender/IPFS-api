import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { GasPriceResponseDto, TransferDto } from './dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractService: ContractsService) {}

  @Get('balance')
  getBalance(@Query('address') address: string) {
    return this.contractService.getAmountToken(address);
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
}
