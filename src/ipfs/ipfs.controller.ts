import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { IpfsService } from './ipfs.service';
import { Response } from 'express';

@Controller('ipfs')
export class IpfsController {
  constructor(private ipfsService: IpfsService) {}

  @Get('status')
  async fileStatus(@Res() res: Response, @Query('cid') cid: string) {
    return res
      .status(HttpStatus.OK)
      .json(await this.ipfsService.fileStatus(cid));
  }

  @Get('directory-contents')
  async getContentsDirectory(@Res() res: Response, @Query('cid') cid: string) {
    return res
      .status(HttpStatus.OK)
      .json(await this.ipfsService.contentDirectory(cid));
  }
}
