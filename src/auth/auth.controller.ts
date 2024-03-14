import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginRequestDto, RegisterRequestDto } from './dto';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() registerRequestDto: RegisterRequestDto) {
    return this.authService.register(registerRequestDto);
  }

  @Post('login')
  login(@Body() loginRequestDto: LoginRequestDto) {
    const user = this.authService.login(loginRequestDto);
    return user;
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@Req() req: Request) {
    console.log(req.user);
    return req.user;
  }
}
