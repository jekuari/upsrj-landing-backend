import { forwardRef, Module } from '@nestjs/common';
import { AccessRightsService } from './access-rights.service';
import { AccessRightsController } from './access-rights.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessRight } from './entities/access-right.entity';
import { SystemModule } from './entities/system-module.entity';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([AccessRight,SystemModule])
  ],
  controllers: [AccessRightsController],
  providers: [AccessRightsService, AuthService],
  exports:[TypeOrmModule, AccessRightsService]
})
export class AccessRightsModule {}
