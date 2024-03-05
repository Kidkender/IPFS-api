import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { TransferIpfsFileDto } from 'src/dto/TransferIpfsFile.dto';

@Injectable()
export class FilesService {
  constructor(private readonly httpService: HttpService) {}

  upload(
    transferFileDto: TransferIpfsFileDto,
  ): Observable<AxiosResponse<JSON>> {
    return this.httpService.post('http://localhost:3001/copy-file');
  }
}
