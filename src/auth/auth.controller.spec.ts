/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// Ensure path-alias imports used by the controller/service resolve in Jest
jest.mock('src/users/users.service', () => ({ UsersService: class {} }), {
  virtual: true,
});

import { AuthController } from './auth.controller';
import { HttpException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService: any = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(mockAuthService as any);
  });

  it('register returns result when success', async () => {
    mockAuthService.register.mockResolvedValue({ success: true });
    await expect(controller.register({} as any)).resolves.toEqual({
      success: true,
    });
  });

  it('register throws HttpException when register fails', async () => {
    mockAuthService.register.mockResolvedValue({
      success: false,
      message: 'bad',
    });
    await expect(controller.register({} as any)).rejects.toBeInstanceOf(
      HttpException,
    );
  });

  it('login forwards to authService.login', async () => {
    mockAuthService.login.mockResolvedValue({ accessToken: 't', email: 'x' });
    await expect(
      controller.login({ email: 'x', password: 'p' }),
    ).resolves.toEqual({ accessToken: 't', email: 'x' });
    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'x',
      password: 'p',
    });
  });
});
