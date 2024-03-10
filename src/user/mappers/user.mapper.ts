import { User } from '@prisma/client';
import { UserWithoutPassword } from '../types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserMapper {
  mapUserToWithPassword(user: User): UserWithoutPassword {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
