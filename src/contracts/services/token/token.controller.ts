import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import { TokenService } from './token.service';
import { TransferDto } from 'src/contracts/dto';

@Controller('contracts/token')
export class TokenContractController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('balance')
  getBalance(@Query('address') address: string) {
    return this.tokenService.getBalance(address);
  }

  @Get('votes')
  getVotes(@Query('address') address: string) {
    return this.tokenService.getVotes(address);
  }

  @Post('transfer')
  async transferToken(@Body() transferDto: TransferDto) {
    return await this.tokenService.transferToken(transferDto);
  }

  @Get('estimate-gas')
  estimateGas(@Body() transferDto: TransferDto) {
    return this.tokenService.estimateGas(transferDto);
  }

  @Get('total-supply')
  getTotalSupply() {
    return this.tokenService.getTotalSupply();
  }

  @Get('reward-amount')
  getRewardTokenAmount() {
    return this.tokenService.getRewardTokenAmount();
  }

  @Get('tax-rate')
  getTxTaxRate() {
    return this.tokenService.getTransactionTaxRate();
  }

  @Post('mint')
  async mintToken(@Query('amount', ParseIntPipe) amount: number) {
    const response = await this.tokenService.mintToken(amount);
    return response;
  }

  @Post('burn')
  async burnToken(@Query('amount', ParseIntPipe) amount: number) {
    const response = await this.tokenService.burnToken(amount);
    return response;
  }

  @Post('delegate')
  async delegate(@Query('address') address: string) {
    const response = await this.tokenService.delegate(address);
    return response;
  }
}
