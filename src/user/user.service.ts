import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserMapper } from './mappers/user.mapper';
import { UserWithoutPassword } from './types';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userMapper: UserMapper,
  ) {}

  getUserById = async (userId: number): Promise<UserWithoutPassword> => {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({
        where: { id: userId },
      });
      return this.userMapper.mapUserToWithPassword(user);
    } catch (error) {
      if ((error.code = 'P2025')) {
        throw new NotFoundException('User not found with id ' + userId);
      }
    }
  };

  checkExistById = (userId: number): boolean => {
    const user = this.getUserById(userId);
    if (!user) {
      return false;
    }
    return true;
  };

  getUsers = async (): Promise<UserWithoutPassword[]> => {
    const users = await this.prismaService.user.findMany();
    return users.map((user) => this.userMapper.mapUserToWithPassword(user));
  };
}
