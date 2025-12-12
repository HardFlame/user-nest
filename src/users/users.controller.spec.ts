/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// Avoid resolving path-alias imports used by services
jest.mock(
  'src/database/database.service',
  () => ({ DatabaseService: class {} }),
  { virtual: true },
);
jest.mock(
  'src/auth/auth.decorator',
  () => ({
    Public: () => () => {},
    Roles: () => () => {},
    Role: { ADMIN: 'ADMIN' },
  }),
  { virtual: true },
);
jest.mock('src/tasks/task.service', () => ({ TasksService: class {} }), {
  virtual: true,
});

import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  const mockUsersService: any = {
    users: jest.fn(),
    user: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UsersController(mockUsersService as any);
  });

  it('update calls updateUser with numeric id', async () => {
    const dto: any = { name: 'x' };
    mockUsersService.updateUser.mockResolvedValue({ id: 4, ...dto });
    await controller.update('4', dto);
    expect(mockUsersService.updateUser).toHaveBeenCalledWith({
      where: { id: 4 },
      data: dto,
    });
  });

  it('remove calls deleteUser with numeric id', () => {
    controller.remove('5');
    expect(mockUsersService.deleteUser).toHaveBeenCalledWith({ id: 5 });
  });
});
