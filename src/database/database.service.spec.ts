/*
  Avoid loading the real generated Prisma client and adapter.
  Provide lightweight mocks for those modules, then require the
  DatabaseService class and instantiate it.
*/

jest.mock('../generated/prisma/client', () => ({ PrismaClient: class {} }), {
  virtual: true,
});
jest.mock(
  '@prisma/adapter-pg',
  () => ({
    PrismaPg: class {
      constructor() {}
    },
  }),
  { virtual: true },
);

import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: any;

  beforeEach(() => {
    service = new DatabaseService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
