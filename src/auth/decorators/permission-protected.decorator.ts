import { SetMetadata } from '@nestjs/common';
import { Authentication, Permission } from '../interfaces';

export const META_PERMISSIONS = 'permissions';

export const PermissionProtected = (permissions: (Authentication | Permission)[]) => { 
    return function (target: object, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) {
        SetMetadata(META_PERMISSIONS, permissions)(target, key, descriptor);
    };
};