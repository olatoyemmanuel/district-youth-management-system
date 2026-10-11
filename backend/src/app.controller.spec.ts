import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './database/prisma.service.js';

describe('AppController', () => {
  let appController: AppController;

  // The root endpoint does not use Prisma, so a lightweight mock is enough.
  const prismaMock = {
    $queryRaw: vi.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('liveness', () => {
    it('should return a healthy API response', () => {
      const response = appController.getHealth();

      expect(response).toEqual({
        status: 'ok',
        service: 'dyms-api',
        timestamp: expect.any(String),
      });

      expect(new Date(response.timestamp).toISOString()).toBe(
        response.timestamp,
      );

      // Liveness must not depend on database availability.
      expect(prismaMock.$queryRaw).not.toHaveBeenCalled();
    });
  });
});
