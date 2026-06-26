import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './entities/lead.entity';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { MailModule } from '../mail/mail.module';
import { EmailTemplatesModule } from '../email-templates/email-templates.module';
import { AuthModule } from 'src/auth/auth.module';
import { AccessRightsModule } from 'src/access-rights/access-rights.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead]),
    MailModule,
    EmailTemplatesModule,
    AuthModule,
    AccessRightsModule,
  ],
  providers: [LeadsService],
  controllers: [LeadsController],
  exports: [LeadsService],
})
export class LeadsModule {}
