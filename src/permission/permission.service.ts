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

  async create(createPermissionDto: CreatePermissionDto, user: User): Promise<Permission> {
    const { moduleId, ...permissionData } = createPermissionDto;

    // Recuperar el módulo relacionado
    const module = await this.SystemModuleRepository.findOneByOrFail({ id: moduleId });

    // Crear y guardar la entidad Permission
    const permission = this.permissionRepository.create({
        ...permissionData,
        user,  // Relación con el usuario autenticado
        module, // Relación con el módulo
    });

    return this.permissionRepository.save(permission);
  }

  



  findAll() {
    return `This action returns all permission`;
  }

  findOne(id: number) {
    return `This action returns a #${id} permission`;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }


  async createPermission(user: User): Promise<Permission[]> {
    // Recuperar todos los módulos existentes
    const modules = await this.SystemModuleRepository.find();
    // Crear permisos para cada módulo y asociarlos al usuario
    const permissions = modules.map(module => {
      const permission = this.permissionRepository.create({
        user, // Relacionamos el usuario
        module, // Relacionamos el módulo
        module_name: module.module_name, // Asignamos el nombre del módulo correctamente
      });

      return permission;
    });

    // Guardar los permisos en la base de datos
    return this.permissionRepository.save(permissions);
  }
}


