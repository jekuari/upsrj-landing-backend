import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from './entities/api-key.entity';
import { ApiKeyService } from './api-keys.service';
import { ApiKeyController } from './api-keys.controller';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AccessRightsModule } from '../access-rights/access-rights.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey]),
    AccessRightsModule,
  ],
  controllers: [ApiKeyController],
  providers: [ApiKeyService, ApiKeyGuard],
  exports: [ApiKeyService, ApiKeyGuard, TypeOrmModule],
})
export class ApiKeyModule {}
