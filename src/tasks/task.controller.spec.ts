/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// Mock database import used by tasks service
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

import { TasksController } from './task.controller';

describe('TasksController', () => {
  let controller: TasksController;
  const mockTasksService: any = {
    tasks: jest.fn(),
    task: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new TasksController(mockTasksService as any);
  });

  it('getAllTasks forwards to tasksService.tasks', async () => {
    mockTasksService.tasks.mockResolvedValue([]);
    await expect(controller.getAllTasks()).resolves.toEqual([]);
    expect(mockTasksService.tasks).toHaveBeenCalledWith({});
  });

  it('getTasksByUserId converts param and calls tasks', async () => {
    mockTasksService.tasks.mockResolvedValue(['a']);
    await expect(controller.getTasksByUserId('8')).resolves.toEqual(['a']);
    expect(mockTasksService.tasks).toHaveBeenCalledWith({
      where: { userId: 8 },
    });
  });

  it('getTaskById converts id and calls task()', async () => {
    mockTasksService.task.mockResolvedValue({ id: 3 });
    await expect(controller.getTaskById('3')).resolves.toEqual({ id: 3 });
    expect(mockTasksService.task).toHaveBeenCalledWith({ id: 3 });
  });

  it('create forwards filtered DTO and request', () => {
    const dto: any = { title: 'x', created: new Date(), updated: new Date() };
    const req = { user: { id: '9', email: 'e' } } as any;
    controller.create(dto, req);
    expect(mockTasksService.createTask).toHaveBeenCalled();
  });

  it('update sets updated and uses request.user.id in where', () => {
    const dto: any = { title: 'y' };
    const req = { user: { id: '10' } } as any;
    controller.update('11', dto, req);
    expect(mockTasksService.updateTask).toHaveBeenCalledWith({
      where: { id: 11, AND: { userId: 10 } },
      data: expect.any(Object),
    });
  });

  it('remove calls deleteTask with numeric id', () => {
    controller.remove('12');
    expect(mockTasksService.deleteTask).toHaveBeenCalledWith({ id: 12 });
  });
});
