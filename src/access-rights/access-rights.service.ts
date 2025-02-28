import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateAccessRightDto } from './dto/update-access-right.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessRight } from './entities/access-right.entity';
import { SystemModule } from './entities/system-module.entity';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { AuthService } from 'src/auth/auth.service';

// Servicio que gestiona la lógica de negocio relacionada con los derechos de acceso
@Injectable()
export class AccessRightsService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService:AuthService,

    @InjectRepository(AccessRight)
    private readonly AccessRightRepository: Repository<AccessRight>,
    
    @InjectRepository(SystemModule)
    private readonly SystemModuleRepository: Repository<SystemModule>,

  ){}

  // Obtener derechos de acceso para un usuario en un módulo específico
  async findOne(userId: string, moduleName: string) { 

    const permissions = await this.AccessRightRepository.findOne({ where: { userId: new ObjectId(userId), moduleName: moduleName}});

    if (!permissions) {
      throw new NotFoundException('Permissions not found');
    }

    return permissions;

  }

  // Obtener todos los derechos de acceso para un usuario
  async findAll(userId: string) {
    const permissions = await this.AccessRightRepository.find({ where: { userId: new ObjectId(userId),}});

    if (!permissions) {
      throw new NotFoundException('Permissions not found');
    }

    return permissions;
  }

  // Actualizar derechos de acceso para un usuario en un módulo específico
  async update(id: string, moduleName: string, updateAccessRightDto: UpdateAccessRightDto) {

    // Verificar si el usuario existe y está activo
    await this.authService.checkUserStatus(id);

    const permissions = await this.AccessRightRepository.find({
        where: { userId: new ObjectId(id), moduleName: moduleName }
    });

    if (!permissions) {
        throw new NotFoundException(`Permissions not found for user ${id} in module ${moduleName}`);
    }

    const updatedPermissions = permissions.map(permission => {
        return this.AccessRightRepository.create({
            ...permission,
            ...updateAccessRightDto,
        });
    });

    this.AccessRightRepository.save(updatedPermissions);
    
    return updatedPermissions;
}

  // Eliminar (borrado lógico) todos los derechos de acceso para un usuario
  async remove(id: string) {
    const permissions = await this.AccessRightRepository.find({ where: { userId: new ObjectId(id) } });

    if (!permissions) {
      throw new NotFoundException('Permissions not found');
    }

    for (const permission of permissions) {
      permission.canCreate = false;
      permission.canRead = false;
      permission.canUpdate = false;
      permission.canDelete = false;
    }

    await this.AccessRightRepository.save(permissions);

    return permissions
  }

  // Crear derechos de acceso para un usuario cuando se crea
  async createPermission(user: User): Promise<AccessRight[]> {
    // Obtener todos los módulos del sistema
    const modules = await this.SystemModuleRepository.find();

    // Crear los permisos asociando el `moduleId` en lugar del objeto completo del módulo
    const permissions = modules.map(module => {
        const permission = this.AccessRightRepository.create({
            userId: user.id,         // Guardamos solo el ID del usuario
            moduleId: module._id,     // Guardamos el ID del módulo
            moduleName: module.moduleName,  // Guardamos el nombre del módulo
            canCreate: false,        // Inicializar permisos por defecto
            canRead: false,           // Solo lectura por defecto
            canUpdate: false,
            canDelete: false,
        });

        return permission;
    });

    // Guardar todos los permisos en la base de datos
    return this.AccessRightRepository.save(permissions);
}

// Obtener permisos por ID de usuario
async getPermissionsByUserId(userId: string): Promise<AccessRight[]> {
  return this.AccessRightRepository.find({
    where: { userId: new ObjectId(userId) }
  });
}

}
