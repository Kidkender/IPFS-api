import { HttpException, HttpStatus } from '@nestjs/common';

export const handleHttpRequestError = (error: any) => {
  const errorMessage =
    error.response?.data?.Message ||
    'An error occurred while processing the request.';
  throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
};
