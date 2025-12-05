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
  const mockTasksService: any = {
    tasks: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UsersController(
      mockUsersService as any,
      mockTasksService as any,
    );
  });

  it('getAllUsers calls users service with deleted:false', async () => {
    mockUsersService.users.mockResolvedValue([]);
    await expect(controller.getAllUsers()).resolves.toEqual([]);
    expect(mockUsersService.users).toHaveBeenCalledWith({
      where: { deleted: false },
    });
  });

  it('getUserById converts id to number and calls user()', async () => {
    mockUsersService.user.mockResolvedValue({ id: 2 });
    await expect(controller.getUserById('2')).resolves.toEqual({ id: 2 });
    expect(mockUsersService.user).toHaveBeenCalledWith({ id: 2 });
  });

  it('getTasksByUserId calls tasksService.tasks', async () => {
    mockTasksService.tasks.mockResolvedValue(['t1']);
    await expect(controller.getTasksByUserId('3')).resolves.toEqual(['t1']);
    expect(mockTasksService.tasks).toHaveBeenCalledWith({
      where: { userId: 3 },
    });
  });

  it('update calls updateUser with numeric id', () => {
    const dto: any = { name: 'x' };
    controller.update('4', dto);
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
