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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { storageConfig } from 'helpers';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { TransferIpfsFileDto } from './dto';
import { IpfsService } from './ipfs.service';

@Controller('ipfs')
export class IpfsController {
  constructor(private ipfsService: IpfsService) {}

  @Post('copy-file')
  async copyFile(
    @Body() transferFileRequestDto: TransferIpfsFileDto,
    @Res() res: Response,
  ) {
    await this.ipfsService.copyFileToMfs(transferFileRequestDto);
    return res
      .status(HttpStatus.OK)
      .json({ message: 'File copied from ipfs to mfs successfully' });
  }

  @Post('mutiple-files')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: storageConfig('avatar'),
    }),
  )
  async uploadFiles(
    @GetUser('id') userId: number,
    @Body('nameFolder') nameFolder: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const response = await this.ipfsService.uploadMutipleFiles(
      userId,
      files,
      nameFolder,
    );
    return response;
  }

  @Get('status')
  async fileStatus(@Res() res: Response, @Query('cid') cid: string) {
    return this.ipfsService.fileStatus(cid);
  }

  @Get('directory-contents')
  async getContentsDirectory(@Res() res: Response, @Query('cid') cid: string) {
    return res
      .status(HttpStatus.OK)
      .json(await this.ipfsService.contentDirectory(cid));
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
