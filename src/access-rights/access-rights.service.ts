import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateAccessRightDto } from './dto/update-access-right.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessRight } from './entities/access-right.entity';
import { SystemModule } from './entities/system-module.entity';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

@Injectable()
export class AccessRightsService {
  constructor(
    @InjectRepository(AccessRight)
    private readonly AccessRightRepository: Repository<AccessRight>,
    
    @InjectRepository(SystemModule)
    private readonly SystemModuleRepository: Repository<SystemModule>
  ){}

  //Get access rights for a user for a specific module
  async findOne(userId: string, moduleName: string) { 

    const permissions = await this.AccessRightRepository.findOne({ where: { userId: new ObjectId(userId), moduleName: moduleName} });

    if (!permissions) {
      throw new NotFoundException('Permissions not found');
    }

    return permissions;

  }

  //Get all access rights for a user
  async findAll(userId: string) {
    const permissions = await this.AccessRightRepository.find({ where: { userId: new ObjectId(userId),}});

    if (!permissions) {
      throw new NotFoundException('Permissions not found');
    }

    return permissions;
  }

  //TODO: update access rights for a user for a specific module
  update(id: string, updateAccessRightDto: UpdateAccessRightDto) {
    return `This action updates a #${id} accessRight`;
  }

  //TODO: deactivate all access rights for a user
  remove(id: number) {
    return `This action removes a #${id} accessRight`;
  }

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


}
