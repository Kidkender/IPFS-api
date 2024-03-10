import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@GetUser() user: User) {
    return user;
  }

  @Get()
  async getUsers() {
    return await this.userService.getUsers();
  }

  @Get('/:id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }
}
