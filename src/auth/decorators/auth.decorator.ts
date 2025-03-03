import { applyDecorators, UseGuards } from '@nestjs/common';
import { Authentication, Permission } from '../interfaces';
import { PermissionProtected } from './permission-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserPermissionGuard } from '../guards/user-permission.guard';

export function Auth(permissions: (Authentication | Permission)[]) {
  return applyDecorators(
    PermissionProtected(permissions),
    UseGuards(AuthGuard('jwt'), UserPermissionGuard),
  );
}