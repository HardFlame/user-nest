/*
  Tests rewritten to avoid importing the generated Prisma client and
  absolute "src/" path modules at load time. We mock those modules
  before requiring the service, then instantiate the service with a
  lightweight mocked DatabaseService implementation.
*/

jest.mock('src/generated/prisma/client', () => ({ Prisma: {} }), {
  virtual: true,
});
jest.mock(
  'src/database/database.service',
  () => {
    return {
      DatabaseService: jest.fn().mockImplementation(() => ({
        userNest: {
          findUnique: jest.fn(),
          findMany: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      })),
    };
  },
  { virtual: true },
);

import { DatabaseService } from 'src/database/database.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService(new DatabaseService());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
