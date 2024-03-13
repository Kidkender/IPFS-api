import { Controller, Get, Query } from '@nestjs/common';
import { ContractsService } from './contracts.service';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractService: ContractsService) {}

  @Get('balance')
  getBalance(@Query('address') address: string) {
    return this.contractService.getAmountToken(address);
  }
}
