import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { system_module } from './entities/systemModule.entity';

@Module({
  controllers: [PermissionController],
  imports:[
    TypeOrmModule.forFeature([Permission, system_module])
  ],
  providers: [PermissionService],
  exports:[TypeOrmModule, PermissionService]
})
export class PermissionModule {}
