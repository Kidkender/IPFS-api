import { Controller, Get } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { GasPriceResponseDto } from './dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractService: ContractsService) {}

  @Get('feeData')
  async getFeeData(): Promise<GasPriceResponseDto> {
    return await this.contractService.getFeeData();
  }
}
