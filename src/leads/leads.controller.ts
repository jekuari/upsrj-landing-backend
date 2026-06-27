import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { ContactLeadDto } from './dto/contact-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * Public endpoint - allows anonymous form submissions from the landing page
   */
  @ApiOperation({ summary: 'Submit a lead from the contact form (public)' })
  @ApiResponse({ status: 201, description: 'Lead created and confirmation email sent' })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  /**
   * Protected endpoint - admin access required to view leads
   */
  @ApiOperation({ summary: 'Get all leads with pagination, search, sort and filter' })
  @ApiBearerAuth('JWT-auth')
  @Auth(['leads:view'])
  @Get()
  findAll(@Query() query: QueryLeadsDto) {
    return this.leadsService.findAll(query);
  }

  /**
   * Protected endpoint - get a single lead by id
   */
  @ApiOperation({ summary: 'Get a single lead' })
  @ApiBearerAuth('JWT-auth')
  @Auth(['leads:view'])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  /**
   * Protected endpoint - update lead status and track history
   */
  @ApiOperation({ summary: 'Update lead status and record history' })
  @ApiBearerAuth('JWT-auth')
  @Auth(['leads:edit'])
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
    @GetUser() user: User,
  ) {
    return this.leadsService.updateStatus(id, dto, user?.email);
  }

  /**
   * Protected endpoint - send email to lead with admin's replyTo
   */
  @ApiOperation({ summary: 'Contact a lead via email' })
  @ApiBearerAuth('JWT-auth')
  @Auth(['leads:edit'])
  @Post(':id/contact')
  contactLead(
    @Param('id') id: string,
    @Body() dto: ContactLeadDto,
    @GetUser() user: User,
  ) {
    return this.leadsService.contactLead(id, dto, user?.email);
  }
}
