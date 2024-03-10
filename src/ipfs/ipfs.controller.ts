import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { AddFileIpfsDto } from './dto';
import { IpfsService } from './ipfs.service';

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

  @Post()
  @UseGuards(JwtAuthGuard)
  async addFile(
    @GetUser('id') userId: number,
    @Body() addFileDto: AddFileIpfsDto,
    @Res() res: Response,
  ) {
    await this.ipfsService.addIpfs(userId, addFileDto);
    return res
      .status(HttpStatus.OK)
      .json({ message: 'Add database successfully' });
  }

  @Get('getall')
  @UseGuards(JwtAuthGuard)
  async getAll(@Res() res: Response) {
    const response = await this.ipfsService.getAllIpfs();
    return res.status(HttpStatus.OK).json(response);
  }

  @Get('/user/:id')
  @UseGuards(JwtAuthGuard)
  getIpfsByUser(@Param('id', ParseIntPipe) userId: number) {
    return this.ipfsService.getIpfsByUserId(userId);
  }
}
