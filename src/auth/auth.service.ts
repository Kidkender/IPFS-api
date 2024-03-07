import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginRequestDto, RegisterRequestDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async register(registerRequestDto: RegisterRequestDto) {
    const hashedPassword = await argon.hash(registerRequestDto.password);
    try {
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
    } catch (error) {
      if (error.code == 'P2002') {
        throw new ForbiddenException('Error in credentials');
      }
    }
  }

  async login(loginRequestDto: LoginRequestDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: loginRequestDto.email,
      },
    });
    if (!user) throw new ForbiddenException('User not found');
    const passwordMatched = await argon.verify(
      user.password,
      loginRequestDto.password,
    );
    if (!passwordMatched) throw new ForbiddenException('Incorrect password');
    delete user.password;
    return await this.generateJwt(user.id, user.email);
  }

  async generateJwt(
    userId: number,
    email: string,
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const jwt = await this.jwtService.signAsync(payload, {
      expiresIn: '10m',
      secret: this.configService.get('JWT_SECRET'),
    });
    return { accessToken: jwt };
  }
}
