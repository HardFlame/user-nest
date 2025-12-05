/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// Mock the database service path alias so requires succeed under Jest
jest.mock(
  'src/database/database.service',
  () => ({ DatabaseService: class {} }),
  { virtual: true },
);

import { HttpException } from '@nestjs/common';
import { TasksService } from './task.service';

describe('TasksService', () => {
  let service: TasksService;
  const mockDb: any = {
    taskNest: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TasksService(mockDb as any);
  });

  it('createTask throws UNAUTHORIZED if user id missing', async () => {
    await expect(
      service.createTask({ title: 'a' } as any, { user: {} as any }),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it('createTask sets userId and calls create', async () => {
    const dto: any = { title: 't' };
    const requestUser = { user: { id: '7', email: 'x' } } as any;
    mockDb.taskNest.create.mockResolvedValue({ id: 1, ...dto, userId: 7 });
    await expect(service.createTask(dto, requestUser)).resolves.toEqual({
      id: 1,
      ...dto,
      userId: 7,
    });
    expect(mockDb.taskNest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 7 }),
    });
  });

  it('tasks calls findMany', async () => {
    mockDb.taskNest.findMany.mockResolvedValue([]);
    await expect(service.tasks({ where: {} })).resolves.toEqual([]);
  });

  it('deleteTask calls delete', async () => {
    mockDb.taskNest.delete.mockResolvedValue({ id: 2 });
    await expect(service.deleteTask({ id: 2 })).resolves.toEqual({ id: 2 });
    expect(mockDb.taskNest.delete).toHaveBeenCalledWith({ where: { id: 2 } });
  });
});
