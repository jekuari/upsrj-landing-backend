import { Injectable, NotFoundException } from '@nestjs/common';
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

    // Método para actualizar permisos de un módulo específico
    // moduleName or moduleId?
    async updatePermissions(userId: string, moduleName: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
      const permission = await this.permissionRepository.findOne({ where: { userId, moduleName } });
      //userid does not exist in type Permission

      if (!permission) {
      throw new NotFoundException(`Permissions for module '${moduleName}' and user with ID '${userId}' not found.`
      );
      }

      Object.assign(permission, updatePermissionDto);
      return this.permissionRepository.save(permission);
  }


}


