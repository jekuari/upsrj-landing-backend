import { SetMetadata } from '@nestjs/common';
import { ValidPermissions, ValidModules } from '../interfaces';

export const META_PERMISSIONS = 'permissions';
export const META_MODULES = 'modules';

// Decorador personalizado para proteger rutas con permisos y módulos específicos
export const PermissionProtected = (permissions: ValidPermissions[], modules: ValidModules[]) => { 

    return function (target: object, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) {
        SetMetadata(META_PERMISSIONS, permissions)(target, key, descriptor);
        SetMetadata(META_MODULES, modules)(target, key, descriptor);
    };
};
