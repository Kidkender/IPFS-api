import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { storageConfig } from 'helpers/config';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { TransferIpfsFileDto } from 'src/files/dto/copy.dto';
import { FilesService } from 'src/files/file.service';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FileController {
  constructor(private readonly fileServices: FilesService) {}

  @Post('upload-file')
  @UseInterceptors(
    FileInterceptor('file', { storage: storageConfig('avatar') }),
  )
  async uploadFile(
    @Req() req: any,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { nameFolderMfs } = req.query;

    const response = await this.fileServices.uploadFile(file, nameFolderMfs);
    return res.status(HttpStatus.OK).json(response);
  }

  @Post('wrap-directory')
  @UseInterceptors(FileInterceptor('file', { storage: storageConfig('image') }))
  async uploadWithDirectory(
    @GetUser('id') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const response = await this.fileServices.uploadWithWrapDirectory(
      userId,
      file,
    );
    return response;
  }

  @Post('copy-file')
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
