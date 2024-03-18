import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import {
  Observable,
  TimeoutError,
  catchError,
  throwError,
  timeout,
} from 'rxjs';

@Injectable()
export class HttpErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpErrorInterceptor.name);
  private readonly routeWithoutTimeout: string[] = [
    '/contracts/mint-token',
    '/contracts/burn-token',
    '/contracts/delegate',
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { url } = request;

    const shouldTimeout = !this.routeWithoutTimeout.some((route) =>
      url.includes(route),
    );

    return next.handle().pipe(
      shouldTimeout ? timeout(5000) : (obs) => obs,

      catchError((error: AxiosError) => {
        if (error instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        const errorMessage = error.response?.data
          ? error.response.data
          : error.message;

        this.logger.error('Request error:  ' + JSON.stringify(errorMessage));

        return throwError(() => new HttpException(errorMessage, error.status));
      }),
    );
  }
}
