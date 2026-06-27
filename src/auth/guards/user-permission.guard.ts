import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { META_PERMISSIONS } from '../decorators/permission-protected.decorator';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class UserPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions: string[] =
      this.reflector.get(META_PERMISSIONS, context.getHandler()) || [];

    if (!requiredPermissions.length) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user || !user.id) {
      throw new BadRequestException('User not found');
    }

    const effectivePermissions = new Set<string>();

    if (user.permissions) {
      user.permissions.forEach(p => effectivePermissions.add(p));
    }

    if (user.roles && user.roles.length > 0) {
      const roles = await this.roleRepository.find({
        where: { name: { $in: user.roles } } as any,
      });
      roles.forEach(role => {
        if (role.permissions) {
          role.permissions.forEach(p => effectivePermissions.add(p));
        }
      });
    }

    const missingPermissions: string[] = [];

    const hasAll = requiredPermissions.every(p => {
      if (effectivePermissions.has(p)) return true;
      missingPermissions.push(p);
      return false;
    });

    if (!hasAll) {
      throw new ForbiddenException(
        `User ${user.fullName} lacks required permissions: ${missingPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
