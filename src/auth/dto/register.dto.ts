import { IsEmail, IsNotEmpty, IsString, isPhoneNumber } from 'class-validator';

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
