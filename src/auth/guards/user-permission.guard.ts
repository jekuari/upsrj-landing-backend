import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { META_PERMISSIONS, RequiredPermission } from '../decorators/permission-protected.decorator';
import { AccessRightsService } from 'src/access-rights/access-rights.service';
import { User } from '../entities/user.entity';

@Injectable()
export class UserPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessRightsService: AccessRightsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions: RequiredPermission[] =
      this.reflector.get(META_PERMISSIONS, context.getHandler()) || [];

    if (!requiredPermissions.length) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user || !user.id) {
      throw new BadRequestException('User not found');
    }

    const userPermissions = await this.accessRightsService.getPermissionsByUserId(user.id.toString());

    const missingPermissions: RequiredPermission[] = [];

    const hasAllPermissions = requiredPermissions.every(({ module, permission }) => {
      const modulePermissions = userPermissions.find(p => p.moduleName === module);
      const hasPermission = modulePermissions?.[permission] === true;

      if (!hasPermission) {
        missingPermissions.push({ module, permission });
      }

      return hasPermission;
    });

    if (!hasAllPermissions) {
      const missingList = missingPermissions
        .map(p => `${p.module}.${p.permission}`)
        .join(', ');

      throw new ForbiddenException(
        `User ${user.fullName} does not have the required permissions: ${missingList}`,
      );
    }

    return true;
  }
}
