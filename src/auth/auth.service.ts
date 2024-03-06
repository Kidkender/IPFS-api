import { Injectable } from '@nestjs/common';
import { LoginRequestDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';

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
  constructor(private jwtService: JwtService) {}

  validateUser({ username, password }: LoginRequestDto) {
    const findUser = fakeUsers.find((user) => user.username === username);
    if (!findUser) return null;

    if (password === findUser.password) {
      const { password, ...user } = findUser;
      return this.jwtService.sign(user);
    }
  }
}
