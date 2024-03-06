import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginRequestDto, RegisterRequestDto } from './dto';

const fakeUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'password',
  },
  { id: 2, username: 'user1', password: 'password1' },
];

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async register(registerRequestDto: RegisterRequestDto) {
    const hashedPassword = await argon.hash(registerRequestDto.password);
    const user = await this.prismaService.user.create({
      data: {
        email: registerRequestDto.email,
        firstName: registerRequestDto.firstName,
        lastName: registerRequestDto.lastName,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
    return user;
  }

  validateUser({ email, password }: LoginRequestDto) {
    const findUser = fakeUsers.find((user) => user.username === email);
    if (!findUser) return null;

    if (password === findUser.password) {
      const { password, ...user } = findUser;
      return this.jwtService.sign(user);
    }
  }
}
