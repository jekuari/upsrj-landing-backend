import { Module } from '@nestjs/common';
import { TemplatesModuleService } from './templates-module.service';
import { TemplatesModuleController } from './templates-module.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesComponent } from './entities/templates-module.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AccessRightsModule } from 'src/access-rights/access-rights.module';

@Module({
  imports: [TypeOrmModule.forFeature([TemplatesComponent]), AuthModule, AccessRightsModule],
  controllers: [TemplatesModuleController],
  providers: [TemplatesModuleService],
  exports: [TemplatesModuleService],
})
export class TemplatesModuleModule {}
