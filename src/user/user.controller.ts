import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('user')
export class UserController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@GetUser() user: User) {
    return user;
  }
}
