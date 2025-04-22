import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PuckComponent } from './entities/puck-component.entity';
import { PuckComponentsService } from './puck-components.service';
import { PuckComponentsController } from './puck-components.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AccessRightsModule } from 'src/access-rights/access-rights.module';

@Module({
  imports: [TypeOrmModule.forFeature([PuckComponent]), AuthModule, AccessRightsModule],
  providers: [PuckComponentsService],
  controllers: [PuckComponentsController],
})
export class PuckComponentsModule {}
