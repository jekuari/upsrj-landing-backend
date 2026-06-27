import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from './entities/api-key.entity';
import { ApiKeyService } from './api-keys.service';
import { ApiKeyController } from './api-keys.controller';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey]),
    AuthModule,
  ],
  controllers: [ApiKeyController],
  providers: [ApiKeyService, ApiKeyGuard],
  exports: [ApiKeyService, ApiKeyGuard, TypeOrmModule],
})
export class ApiKeyModule {}
