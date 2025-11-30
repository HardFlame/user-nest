/*
  Tests rewritten to avoid importing the generated Prisma client at load
  time. We mock the Prisma types, then require the controller and
  instantiate it with a lightweight UsersService mock.
*/

jest.mock('src/generated/prisma/client', () => ({ UserNest: {} }), {
  virtual: true,
});
jest.mock(
  'src/database/database.service',
  () => ({ DatabaseService: class {} }),
  { virtual: true },
);

import { UsersController } from './users.controller';
import { DatabaseService } from 'src/database/database.service';

describe('UsersController', () => {
  let controller: any;
  beforeEach(() => {
    const usersServiceMock = {
      database: new DatabaseService(),
      users: jest.fn(),
      user: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };
    controller = new UsersController(usersServiceMock);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
