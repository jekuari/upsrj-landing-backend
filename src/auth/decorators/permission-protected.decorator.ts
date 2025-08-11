import { SetMetadata } from '@nestjs/common';

export const META_PERMISSIONS = 'permissions';

export type ModuleName = 'Authentication' | 'Images' | 'Permission' | 'Puck' | 'Videos' | 'Files' | 'Blog' | 'Templates';
export type PermissionType = 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete';

export interface RequiredPermission {
  module: ModuleName;
  permission: PermissionType;
}

export const PermissionProtected = (permissions: RequiredPermission[]) =>
  SetMetadata(META_PERMISSIONS, permissions);
