import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { initialData, initialUsers } from './data/seed-data';

import { AuthService } from '../auth/auth.service';
import { Permission } from '../auth/entities/permission.entity';
import { ALL_PERMISSIONS } from '../auth/enums/permission.enum';

@Injectable()
export class SeedService {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Permission)
    private readonly permissionRepo: MongoRepository<Permission>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async executeSeed(password: string) {
    const PASSWORD_SEED = this.config.get<string>('PASSWORD_SEED');
    if (password !== PASSWORD_SEED) {
      throw new BadRequestException('The password is wrong');
    }

    await this.seedPermissions();

    await Promise.all(
      initialUsers.map(async (dto) => {
        try {
          await this.authService.createSeed(dto);
        } catch (err: any) {
          if (err.code !== 11000) {
            console.error('Error creando usuario seed', err);
            throw err;
          }
        }
      }),
    );

    return 'Seed executed successfully';
  }

  private async seedPermissions() {
    await Promise.all(
      ALL_PERMISSIONS.map(async (name) => {
        try {
          await this.permissionRepo.updateOne(
            { name },
            { $setOnInsert: { name } },
            { upsert: true },
          );
        } catch (err: any) {
          if (err.code !== 11000) throw err;
        }
      }),
    );
  }
}
