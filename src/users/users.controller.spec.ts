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

  it('getUserByQuery without params calls users service with deleted:false', async () => {
    mockUsersService.users.mockResolvedValue([]);
    await expect(controller.getUserByQuery()).resolves.toEqual([]);
    expect(mockUsersService.users).toHaveBeenCalledWith({
      where: { deleted: false },
    });
  });

  it('getUserByQuery with id returns user by id', async () => {
    mockUsersService.users.mockResolvedValue([{ id: 2, email: 'test' }]);
    await controller.getUserByQuery('2');
    expect(mockUsersService.users).toHaveBeenCalledWith({
      where: { deleted: false, id: 2 },
    });
  });

  it('getTasksByUserId calls tasksService.tasks with userId filter', async () => {
    mockTasksService.tasks.mockResolvedValue(['t1']);
    await expect(controller.getTasksByUserId('3')).resolves.toEqual(['t1']);
    expect(mockTasksService.tasks).toHaveBeenCalledWith({
      where: { userId: 3 },
    });
  });

  it('getUserByQuery merges custom where with deleted:false', async () => {
    mockUsersService.users.mockResolvedValue([]);
    await controller.getUserByQuery(undefined, '{"email":"test@example.com"}');
    expect(mockUsersService.users).toHaveBeenCalledWith({
      where: { deleted: false, AND: { email: 'test@example.com' } },
    });
  });

  it('getUserByQuery applies skip, take, and orderBy', async () => {
    mockUsersService.users.mockResolvedValue([]);
    await controller.getUserByQuery(
      undefined,
      undefined,
      '5',
      '10',
      '{"id":"desc"}',
    );
    expect(mockUsersService.users).toHaveBeenCalledWith({
      where: { deleted: false },
      skip: 5,
      take: 10,
      orderBy: { id: 'desc' },
    });
  });

  it('getUserByQuery ignores invalid where JSON', async () => {
    mockUsersService.users.mockResolvedValue([]);
    await controller.getUserByQuery(undefined, 'invalid-json');
    expect(mockUsersService.users).toHaveBeenCalledWith({
      where: { deleted: false },
    });
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
