import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserNestCreateInput } from 'src/generated/prisma/models';
import { type StringValue } from 'ms';
import bcrypt from 'bcrypt';
import { Roles } from 'src/generated/prisma/enums';
import { type Request as RequestType } from 'express';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(user: UserNestCreateInput) {
    let status: {
      success: boolean;
      message: string;
      expiresIn?: string;
      accessToken?: string;
      RefreshExpiresIn?: string;
      refreshToken?: string;
    } = {
      success: true,
      message: 'user registered',
    };

    try {
      const newUser = await this.usersService.createUser(user);
      const tokens = await this._createTokens({
        email: newUser.email,
        id: newUser.id,
        roles: newUser.roles,
      });
      await this.updateRefreshToken(newUser.id, tokens.refreshToken);
      status = { ...status, ...tokens };
    } catch (err) {
      status = {
        success: false,
        message: String(err),
      };
      throw new BadRequestException(status.message);
    }
    return status;
  }

  async login(user: { email: string; password: string }) {
    const data = await this.validateUser(user.email, user.password);
    const token = await this._createTokens({
      email: data.email,
      id: data.id,
      roles: data.roles,
    });
    await this.updateRefreshToken(data.id, token.refreshToken);
    return {
      email: data.email,
      ...token,
    };
  }

  async logout(req: RequestType) {
    const userId = (req.user as { id: number | string }).id;
    if (!userId) {
      throw new UnauthorizedException('Already no longer logged in');
    }
    return await this.updateRefreshToken(+userId, null);
  }

  async hashData(data: string) {
    const passSalt = process.env.PASS_SALT;
    if (!passSalt) {
      throw new Error('PASS_SALT environment variable is not set');
    }
    const genPassSalt = await bcrypt.genSalt(10);
    return await bcrypt.hash(data, genPassSalt);
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.user({ email });
    if (
      user &&
      (user.password === pass ||
        bcrypt.compareSync(pass, String(user?.password)))
    ) {
      return user;
    }
    throw new UnauthorizedException();
  }

  private async _createTokens(user: {
    email: string;
    id: number;
    roles: Roles[];
  }) {
    const expiresIn = process.env.EXPIRESIN;
    const RefreshExpiresIn = process.env.REFRESHEXPIRESIN;
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    if (!expiresIn) {
      throw new Error('EXPIRESIN environment variable is not set');
    }
    if (!jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
    if (!RefreshExpiresIn) {
      throw new Error('REFRESHEXPIRESIN environment variable is not set');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(user, {
        secret: jwtSecret,
        expiresIn: expiresIn as StringValue,
      }),
      this.jwtService.signAsync(user, {
        secret: jwtRefreshSecret,
        expiresIn: RefreshExpiresIn as StringValue,
      }),
    ]);
    return {
      expiresIn,
      accessToken,
      RefreshExpiresIn,
      refreshToken,
    };
  }

  async refreshTokens(req: RequestType) {
    const { id: userId, refreshToken } = req.user as {
      id: number | string;
      refreshToken: string;
    };
    if (!userId) {
      throw new BadRequestException();
    }
    const user = await this.usersService.user({ id: +userId });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const verifyTokens = bcrypt.compareSync(refreshToken, user.refreshToken);
    if (!verifyTokens) {
      throw new UnauthorizedException('Access Denied');
    }
    const tokens = await this._createTokens({
      email: user.email,
      id: user.id,
      roles: user.roles,
    });
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return { email: user.email, ...tokens };
  }

  async updateRefreshToken(userId: number, refreshToken: string | null) {
    const hashedRefreshToken = refreshToken
      ? await this.hashData(refreshToken)
      : null;
    return await this.usersService.updateUser({
      where: { id: userId },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });
  }
}
