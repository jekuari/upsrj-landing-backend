import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_PERMISSIONS, META_MODULES } from '../decorators/permission-protected.decorator';
import { User } from '../entities/user.entity';
import { AccessRightsService } from 'src/access-rights/access-rights.service';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(
    private readonly reflector:Reflector,
    private readonly accessRightsService: AccessRightsService
  ){}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const validPermissions: string[] = this.reflector.get(META_PERMISSIONS, context.getHandler()) || [];
    const validModules: string[] = this.reflector.get(META_MODULES, context.getHandler()) || [];
  
    if (!validPermissions) return true;

    if (!validPermissions.length || !validModules.length) return true;
  
    // Obtener el usuario desde el request
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;
  
    if (!user || !user.id) {
      throw new BadRequestException('User not found');
    }
  
    // Obtener permisos del usuario
    const userPermissions = await this.accessRightsService.getPermissionsByUserId(user.id.toString());
    //console.log({ userPermissions });
  
    // Verificar que el usuario tenga permisos en CADA módulo especificado
    const hasAllPermissionsInAllModules = validModules.every(moduleName => {
      // Buscar los permisos del usuario en este módulo
      const modulePermissions = userPermissions.find(permission => permission.moduleName === moduleName);
  
      // Si no tiene permisos para este módulo, falla automáticamente
      if (!modulePermissions) return false;
  
      // Verificar que tenga TODOS los permisos requeridos en este módulo
      return validPermissions.every(p => modulePermissions[p] === true);
    });
  
    if (!hasAllPermissionsInAllModules) {
      throw new ForbiddenException(
        `User ${user.fullName} does not have the required permissions (${validPermissions.join(', ')}) for the required modules (${validModules.join(', ')})`
      );
    }
  
    return true;
  }
  
}