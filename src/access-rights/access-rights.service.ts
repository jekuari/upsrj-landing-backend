import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}

  // Obtener derechos de acceso para un usuario en un módulo específico
  async findOne(id: string, moduleName: string) { 

    // Verificar si el id del usuario tiene un formato válido
    const userid = await this.validateUserIdorMatricula(id);

    // Verificar si el módulo existe
    const module = await this.SystemModuleRepository.findOne({ where: { moduleName: moduleName } });

    if (!module) {
      throw new BadRequestException(`Module ${moduleName} not found`);
    }

    const permissions = await this.AccessRightRepository.findOne({ where: { userId: new ObjectId(userid), moduleName: moduleName}});

    if (!permissions) {
      throw new NotFoundException('Permissions not found');
    }

    return permissions;

  }

  // Obtener todos los derechos de acceso para un usuario
  async findAll(id: string) {

    // Verificar si el id del usuario tiene un formato válido
    const userid = await this.validateUserIdorMatricula(id);

    const permissions = await this.AccessRightRepository.find({ where: { userId: new ObjectId(userid),}});

    if (!permissions || permissions.length === 0) {
      throw new NotFoundException('Permissions not found');
    }

    return permissions;
  }

  // Actualizar derechos de acceso para un usuario en un módulo específico
  async update(id: string, moduleName: string, updateAccessRightDto: UpdateAccessRightDto) {

    // Verificar si el id del usuario tiene un formato válido
    const userid = await this.validateUserIdorMatricula(id);

    // Verificar si el usuario existe y está activo
    await this.authService.checkUserStatus(userid);

    // Verificar si el módulo existe
    const module = await this.SystemModuleRepository.findOne({ where: { moduleName: moduleName } });

    if (!module) {
      throw new BadRequestException(`Module ${moduleName} not found`);
    }

    const permissions = await this.AccessRightRepository.find({
        where: { userId: new ObjectId(userid), moduleName: moduleName }
    });

    if (!permissions) {
        throw new NotFoundException(`Permissions not found for user ${userid} in module ${moduleName}`);
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

    // Verificar si el id del usuario tiene un formato válido
    const userid = await this.validateUserIdorMatricula(id);

    // Verificar si el usuario existe y está activo
    await this.authService.checkUserStatus(userid);

    const permissions = await this.AccessRightRepository.find({ where: { userId: new ObjectId(userid) } });

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

  // Validar si el ID de usuario o matrícula es válido
  async validateUserIdorMatricula(userIdOrMatricula: string) {
    try {
      const query = ObjectId.isValid(userIdOrMatricula)
        ? { _id: new ObjectId(userIdOrMatricula) }
        : { matricula: userIdOrMatricula };

      const user = await this.userRepository.findOne({ where: query });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const userId = user.id.toString();
      
      return userId;
  }
  catch (error) {
    console.error('Error in validateUserIdorMatricula:', error.message);
    throw new InternalServerErrorException(`Error validating user ID or matricula: ${error.message}`);
  }
}

// Obtener permisos por ID de usuario
async getPermissionsByUserId(userId: string): Promise<AccessRight[]> {

  return this.AccessRightRepository.find({
    where: { userId: new ObjectId(userId) }
  });
  }

}
