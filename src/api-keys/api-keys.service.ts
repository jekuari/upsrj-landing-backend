import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ApiKey } from './entities/api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: MongoRepository<ApiKey>,
  ) {}

  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  async create(userId: string, createDto: CreateApiKeyDto) {
    const rawKey = `upsrj_${uuidv4()}_${crypto.randomBytes(16).toString('hex')}`;
    const hashedKey = this.hashKey(rawKey);

    const apiKey = this.apiKeyRepository.create({
      userId: new ObjectId(userId),
      hashedKey,
      name: createDto.name,
      description: createDto.description,
      expiresAt: new Date(createDto.expiresAt),
      permissions: createDto.permissions,
    });

    await this.apiKeyRepository.save(apiKey);

    return { ...apiKey, rawKey };
  }

  async findAll(userId: string) {
    return await this.apiKeyRepository.find({ where: { userId: new ObjectId(userId) } });
  }

  async remove(userId: string, id: string) {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { _id: new ObjectId(id), userId: new ObjectId(userId) },
    });
    if (!apiKey) throw new NotFoundException('API Key not found');
    await this.apiKeyRepository.delete(apiKey._id);
  }
}
