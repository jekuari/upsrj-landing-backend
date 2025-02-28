import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidPermissions, ValidModules } from '../interfaces';
import { PermissionProtected } from './permission-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';

// Decorador personalizado para proteger rutas con permisos y módulos específicos
export function Auth(permissions: ValidPermissions[], modules: ValidModules[] ) {

  return applyDecorators(
    PermissionProtected(permissions, modules), // Aplica el decorador de permisos
    UseGuards( AuthGuard('jwt'), UserRoleGuard), // Aplica los guards de autenticación y roles de usuario
  );
}
