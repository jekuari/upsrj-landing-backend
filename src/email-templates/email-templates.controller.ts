import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators';
import { EmailTemplatesService } from './email-templates.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@ApiTags('Email Templates')
@ApiBearerAuth('JWT-auth')
@Controller('email-templates')
export class EmailTemplatesController {
  constructor(private readonly service: EmailTemplatesService) {}

  @ApiOperation({ summary: 'Create an email template' })
  @Auth([{ module: 'EmailTemplates', permission: 'canCreate' }])
  @Post()
  create(@Body() dto: CreateEmailTemplateDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Get all email templates' })
  @Auth([{ module: 'EmailTemplates', permission: 'canRead' }])
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Get a single email template' })
  @Auth([{ module: 'EmailTemplates', permission: 'canRead' }])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Update an email template' })
  @Auth([{ module: 'EmailTemplates', permission: 'canUpdate' }])
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmailTemplateDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete an email template' })
  @Auth([{ module: 'EmailTemplates', permission: 'canDelete' }])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
