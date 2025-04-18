import { applyDecorators, UseGuards } from '@nestjs/common';
import { Authentication, Image, Permission, Puck } from './../interfaces/valid-permissions';
import { PermissionProtected } from './permission-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserPermissionGuard } from '../guards/user-permission.guard';


export function Auth(permissions: (Authentication| Image| Permission| Puck )[]) {
  return applyDecorators(
    PermissionProtected(permissions),
    UseGuards(AuthGuard('jwt'), UserPermissionGuard),
  );
}