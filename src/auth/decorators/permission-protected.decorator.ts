import { SetMetadata } from '@nestjs/common';

export const META_PERMISSIONS = 'permissions';

export interface RequiredPermission {
  module: string;
  permission: string;
}

export const PermissionProtected = (permissions: string[]) =>
  SetMetadata(META_PERMISSIONS, permissions);
