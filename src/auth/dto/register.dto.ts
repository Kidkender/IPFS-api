import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterRequestDto {
  firstName: string;
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
