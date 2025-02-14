import { SetMetadata } from '@nestjs/common';
import { ValidPermissions } from '../interfaces';

export const META_ROLE ='roles';

export const RoleProtected = (...args: ValidPermissions[]) =>{ 
    
    
    return SetMetadata(META_ROLE, args);
}
