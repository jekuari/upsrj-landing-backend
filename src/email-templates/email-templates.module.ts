import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from './entities/email-template.entity';
import { EmailTemplatesService } from './email-templates.service';
import { EmailTemplatesController } from './email-templates.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AccessRightsModule } from 'src/access-rights/access-rights.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplate]),
    AuthModule,
    AccessRightsModule,
  ],
  providers: [EmailTemplatesService],
  controllers: [EmailTemplatesController],
  exports: [EmailTemplatesService],
})
export class EmailTemplatesModule {}
