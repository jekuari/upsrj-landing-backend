import { applyDecorators, UseGuards } from '@nestjs/common';
import { PermissionProtected, RequiredPermission } from './../decorators/permission-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserPermissionGuard } from '../guards/user-permission.guard';

// El decorador Auth recibe un array de objetos tipo RequiredPermission
export function Auth(permissions: RequiredPermission[]) {
  return applyDecorators(
    // Aplicamos el decorador PermissionProtected que setea los permisos requeridos
    PermissionProtected(permissions),
    // Aplicamos el guard de autenticación y el guard de permisos
    UseGuards(AuthGuard('jwt'), UserPermissionGuard),
  );
}
