import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyService } from '../api-keys.service';
import { REQUIRE_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: MongoRepository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKeyRaw = request.headers['x-api-key'];

    if (!apiKeyRaw) throw new UnauthorizedException('API Key missing');

    const hashedKey = crypto.createHash('sha256').update(apiKeyRaw).digest('hex');
    const apiKey = await this.apiKeyRepository.findOne({ where: { hashedKey } });

    if (!apiKey || apiKey.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired API Key');
    }

    const requiredPermissions = this.reflector.get<string[]>(REQUIRE_PERMISSIONS_KEY, context.getHandler()) || [];

    const hasPermission = requiredPermissions.every(p => apiKey.permissions.includes(p));
    if (!hasPermission) throw new ForbiddenException('Insufficient permissions');

    // Attach user information if needed (or just the api key)
    request.user = { id: apiKey.userId };

    return true;
  }
}
