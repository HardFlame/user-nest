import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserNestCreateInput } from 'src/generated/prisma/models';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(user: UserNestCreateInput) {
    let status = {
      success: true,
      message: 'user registered',
    };

    try {
      await this.usersService.createUser(user);
    } catch (err) {
      status = {
        success: false,
        message: String(err),
      };
    }
    return status;
  }

  async login(user: { email: string; password: string }) {
    const data = await this.validateUser(user.email, user.password);
    const token = this._createToken({ email: data.email, id: data.id });
    return {
      email: data.email,
      ...token,
    };
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.user({ email });
    if (user?.password === pass) {
      return user;
    }
    throw new UnauthorizedException();
  }

  private _createToken(user: { email: string; id: number }) {
    const expiresIn = process.env.EXPIRESIN;
    const accessToken = this.jwtService.sign(user);
    return {
      expiresIn,
      accessToken,
    };
  }
}
