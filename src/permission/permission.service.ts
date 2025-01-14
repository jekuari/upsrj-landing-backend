import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { system_module } from './entities/systemModule.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(system_module)
    private readonly SystemModuleRepository: Repository<system_module>
  ){}

  async createPermission(user: User): Promise<Permission[]> {

    const modules = await this.SystemModuleRepository.find();

    const permissions = modules.map(module => {
      const permission = this.permissionRepository.create({
        user,
        module, 
        module_name: module.module_name, 
      });

      return permission;
    });

    return this.permissionRepository.save(permissions);
  }
}


