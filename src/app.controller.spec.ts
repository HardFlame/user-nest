/*
  Simplified test that mocks the Prisma client and DatabaseService
  to avoid loading heavy runtime deps. Instantiates AppController
  manually with a mocked AppService/DatabaseService.
*/

jest.mock('src/generated/prisma/client', () => ({ PrismaClient: class {} }), {
  virtual: true,
});
jest.mock('./generated/prisma/client', () => ({ PrismaClient: class {} }), {
  virtual: true,
});
jest.mock(
  'src/database/database.service',
  () => ({ DatabaseService: class {} }),
  { virtual: true },
);
jest.mock(
  './database/database.service',
  () => ({ DatabaseService: class {} }),
  { virtual: true },
);

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from 'src/database/database.service';

describe('AppController', () => {
  let appController: any;

  beforeEach(() => {
    const db = new DatabaseService();
    const appService = new AppService(db);
    appController = new AppController(appService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });
});
