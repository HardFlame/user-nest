/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

// Prevent Jest from trying to resolve the TS path-alias `src/...` imports
jest.mock(
  'src/database/database.service',
  () => ({ DatabaseService: class {} }),
  { virtual: true },
);

import { HttpException } from '@nestjs/common';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const mockDb: any = {
    userNest: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(mockDb as any);
  });

  it('returns a user from user()', async () => {
    const expected = { id: 1, email: 'a@b' };
    mockDb.userNest.findUnique.mockResolvedValue(expected);
    await expect(service.user({ id: 1 })).resolves.toEqual(expected);
    expect(mockDb.userNest.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('returns users from users()', async () => {
    const expected = [{ id: 1 }];
    mockDb.userNest.findMany.mockResolvedValue(expected);
    await expect(service.users({ where: { deleted: false } })).resolves.toEqual(
      expected,
    );
    expect(mockDb.userNest.findMany).toHaveBeenCalledWith({
      skip: undefined,
      take: undefined,
      cursor: undefined,
      where: { deleted: false },
      orderBy: undefined,
    });
  });

  it('createUser calls create on db', async () => {
    const dto = { email: 'x' } as any;
    mockDb.userNest.create.mockResolvedValue(dto);
    await expect(service.createUser(dto)).resolves.toEqual(dto);
    expect(mockDb.userNest.create).toHaveBeenCalledWith({ data: dto });
  });

  it('deleteUser throws HttpException when update fails (admin protected)', async () => {
    mockDb.userNest.update.mockRejectedValue(new Error('fail'));
    await expect(service.deleteUser({ id: 1 })).rejects.toBeInstanceOf(
      HttpException,
    );
  });
});
