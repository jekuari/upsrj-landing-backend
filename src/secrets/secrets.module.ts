import { Module } from '@nestjs/common';
import { SecretsController } from './secrets.controller';
import { ApiKeyModule } from '../api-keys/api-keys.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ApiKeyModule, ConfigModule],
  controllers: [SecretsController],
})
export class SecretsModule {}
