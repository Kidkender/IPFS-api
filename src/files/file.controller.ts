import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { TransferIpfsFileDto } from 'src/files/dto/copy.dto';
import { FilesService } from 'src/files/file.service';

@Controller('/files')
export class FileController {
  private readonly fileServices: FilesService;

  @Post('/copy-file')
  async copyFile(
    @Body() transferFileRequestDto: TransferIpfsFileDto,
    @Res() res: Response,
  ) {
    await this.fileServices.copyFileToMfs(transferFileRequestDto);
    return res
      .status(HttpStatus.OK)
      .json({ message: 'File copied from ipfs to mfs successfully' });
  }
}
