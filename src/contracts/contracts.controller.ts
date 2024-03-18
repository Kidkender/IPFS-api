import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { GasPriceResponseDto, TransferDto } from './dto';

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

  @Post('mint-token')
  async mintToken(@Query('amount', ParseIntPipe) amount: number) {
    const response = await this.contractService.mintToken(amount);
    return response;
  }

  @Post('burn-token')
  async burnToken(@Query('amount', ParseIntPipe) amount: number) {
    const response = await this.contractService.burnToken(amount);
    return response;
  }

  @Post('delegate')
  async delegate(@Query('address') address: string) {
    const response = await this.contractService.delegate(address);
    return response;
  }
}
