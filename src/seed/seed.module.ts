import { forwardRef, Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/auth/entities/permission.entity';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
  imports:[
    ConfigModule,
    TypeOrmModule.forFeature([Permission]),
    forwardRef(() => AuthModule),  
  ]
})
export class SeedModule {}
