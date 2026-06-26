import { Test, TestingModule } from '@nestjs/testing';
import { SecretsController } from './secrets.controller';
import { InfisicalService } from '../infisical/infisical.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiKey } from '../api-keys/entities/api-key.entity';
import { Reflector } from '@nestjs/core';

const mockInfisicalService = {
  forceReload: jest.fn().mockResolvedValue(undefined),
};

const mockRepository = {
  findOne: jest.fn(),
};

describe('SecretsController', () => {
  let controller: SecretsController;
  let service: InfisicalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecretsController],
      providers: [
        {
          provide: InfisicalService,
          useValue: mockInfisicalService,
        },
        {
          provide: Reflector,
          useValue: { get: jest.fn() },
        },
        {
          provide: getRepositoryToken(ApiKey),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<SecretsController>(SecretsController);
    service = module.get<InfisicalService>(InfisicalService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('reload', () => {
    it('should call forceReload on InfisicalService', async () => {
      const result = await controller.reload();
      expect(service.forceReload).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Secrets reloaded successfully' });
    });
  });
});

