import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserMapper } from './mappers/user.mapper';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, UserMapper],
})
export class UserModule {}
