import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { system_module } from '../permission/entities/systemModule.entity';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports:[
    TypeOrmModule.forFeature([system_module])
  ]
})
export class SeedModule {}
