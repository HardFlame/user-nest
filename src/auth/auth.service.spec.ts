/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// Mock path-alias imports used by the service implementation
require('dotenv').config({ path: '.env' });
jest.mock('src/users/users.service', () => ({ UsersService: class {} }), {
  virtual: true,
});

import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const mockUsersService: any = {
    user: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
  };
  const mockJwtService: any = {
    sign: jest.fn().mockReturnValue('token'),
    signAsync: jest.fn().mockReturnValue('token'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(mockUsersService as any, mockJwtService as any);
  });

  it('validateUser returns user when password matches', async () => {
    mockUsersService.user.mockResolvedValue({
      email: 'a',
      password: 'p',
      id: 1,
    });
    await expect(service.validateUser('a', 'p')).resolves.toEqual({
      email: 'a',
      password: 'p',
      id: 1,
    });
  });

  it('validateUser throws when password does not match', async () => {
    mockUsersService.user.mockResolvedValue({ email: 'a', password: 'x' });
    await expect(service.validateUser('a', 'p')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('login returns an object with token and email', async () => {
    mockUsersService.user.mockResolvedValue({
      email: 'b',
      password: 'b',
      id: 2,
    });
    mockJwtService.sign.mockReturnValue('signed');
    await expect(
      service.login({ email: 'b', password: 'b' }),
    ).resolves.toMatchObject({ email: 'b', accessToken: 'token' });
  });
});
