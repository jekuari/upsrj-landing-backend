import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogComponent } from './entities/blog.entity';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AccessRightsModule } from 'src/access-rights/access-rights.module';

@Module({
  imports: [TypeOrmModule.forFeature([BlogComponent]), AuthModule, AccessRightsModule],
  providers: [BlogService],
  controllers: [BlogController],
})
export class BlogModule {}
