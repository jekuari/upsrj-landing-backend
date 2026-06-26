import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ApiKeyGuard } from './api-key.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';

const mockRepository = () => ({
  findOne: jest.fn(),
});

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let repository: MongoRepository<ApiKey>;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyGuard,
        { provide: Reflector, useValue: { get: jest.fn() } },
        {
          provide: getRepositoryToken(ApiKey),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    guard = module.get<ApiKeyGuard>(ApiKeyGuard);
    repository = module.get<MongoRepository<ApiKey>>(getRepositoryToken(ApiKey));
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockRequest = (key: string | null) => ({
    headers: { 'x-api-key': key },
  });

  const createMockContext = (request: any) => ({
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
  });

  it('should throw UnauthorizedException if key is missing', async () => {
    const ctx = createMockContext(createMockRequest(null));
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if key is invalid', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);
    const ctx = createMockContext(createMockRequest('invalid-key'));
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if key is expired', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue({
      expiresAt: new Date(Date.now() - 1000),
    } as any);
    const ctx = createMockContext(createMockRequest('expired-key'));
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException if permissions are missing', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue({
      expiresAt: new Date(Date.now() + 1000),
      permissions: ['read'],
    } as any);
    jest.spyOn(reflector, 'get').mockReturnValue(['write']);
    const ctx = createMockContext(createMockRequest('valid-key'));
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(ForbiddenException);
  });

  it('should return true if key is valid and has permissions', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue({
      expiresAt: new Date(Date.now() + 1000),
      permissions: ['reload_secrets'],
      userId: 'user-id',
    } as any);
    jest.spyOn(reflector, 'get').mockReturnValue(['reload_secrets']);
    const ctx = createMockContext(createMockRequest('valid-key'));
    const result = await guard.canActivate(ctx as any);
    expect(result).toBe(true);
  });
});
