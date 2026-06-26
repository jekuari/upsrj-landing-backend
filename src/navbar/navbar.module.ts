import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavbarService } from './navbar.service';
import { NavbarController } from './navbar.controller';
import { NavbarConfig } from './entities/navbar.entity';
import { AuthModule } from '../auth/auth.module';
import { AccessRightsModule } from '../access-rights/access-rights.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NavbarConfig]),
    AuthModule,
    AccessRightsModule,
  ],
  controllers: [NavbarController],
  providers: [NavbarService],
  exports: [NavbarService],
})
export class NavbarModule {}
