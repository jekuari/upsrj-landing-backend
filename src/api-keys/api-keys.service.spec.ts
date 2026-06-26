import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ApiKeyService } from './api-keys.service';
import { ApiKey } from './entities/api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { ObjectId } from 'mongodb';

const mockRepository = () => ({
  create: jest.fn().mockImplementation(dto => dto),
  save: jest.fn().mockImplementation(entity => Promise.resolve(entity)),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let repository: MongoRepository<ApiKey>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: getRepositoryToken(ApiKey),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
    repository = module.get<MongoRepository<ApiKey>>(getRepositoryToken(ApiKey));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an API key and return raw key', async () => {
      const userId = new ObjectId().toHexString();
      const dto: CreateApiKeyDto = {
        name: 'Test Key',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        permissions: ['reload_secrets'],
      };

      const result = await service.create(userId, dto);

      expect(result.rawKey).toBeDefined();
      expect(result.rawKey).toMatch(/^upsrj_/);
      expect(repository.save).toHaveBeenCalled();
      expect(result.hashedKey).not.toBe(result.rawKey);
    });
  });

  describe('findAll', () => {
    it('should return keys for a user', async () => {
      const userId = new ObjectId().toHexString();
      const mockKeys = [{ name: 'Key 1' }, { name: 'Key 2' }];
      jest.spyOn(repository, 'find').mockResolvedValue(mockKeys as any);

      const result = await service.findAll(userId);

      expect(result).toEqual(mockKeys);
      expect(repository.find).toHaveBeenCalledWith({
        where: { userId: new ObjectId(userId) },
      });
    });
  });

  describe('remove', () => {
    it('should remove a key if it belongs to the user', async () => {
      const userId = new ObjectId().toHexString();
      const keyId = new ObjectId().toHexString();
      jest.spyOn(repository, 'findOne').mockResolvedValue({ _id: new ObjectId(keyId) } as any);
      jest.spyOn(repository, 'delete').mockResolvedValue({ deleted: 1 } as any);

      await service.remove(userId, keyId);

      expect(repository.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if key not found', async () => {
      const userId = new ObjectId().toHexString();
      const keyId = new ObjectId().toHexString();
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      await expect(service.remove(userId, keyId)).rejects.toThrow('API Key not found');
    });
  });
});
