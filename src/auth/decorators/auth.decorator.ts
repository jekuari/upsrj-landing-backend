import { applyDecorators, UseGuards } from '@nestjs/common';
import { PermissionProtected } from './../decorators/permission-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserPermissionGuard } from '../guards/user-permission.guard';

export function Auth(permissions: string[]) {
  return applyDecorators(
    // Aplicamos el decorador PermissionProtected que setea los permisos requeridos
    PermissionProtected(permissions),
    // Aplicamos el guard de autenticación y el guard de permisos
    UseGuards(AuthGuard('jwt'), UserPermissionGuard),
  );
}
