import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidPermissions, ValidModules } from '../interfaces';
import { PermissionProtected } from './permission-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';

export function Auth(permissions: ValidPermissions[], modules: ValidModules[] ) {

  return applyDecorators(
    PermissionProtected(permissions, modules),
    UseGuards( AuthGuard('jwt'), UserRoleGuard),
  );
}
