import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';

@Module({
  controllers: [PermissionController],
  imports:[
    TypeOrmModule.forFeature([Permission])
  ],
  providers: [PermissionService],
})
export class PermissionModule {}
