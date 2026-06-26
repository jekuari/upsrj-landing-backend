import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Lead, LeadStatus } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { ContactLeadDto } from './dto/contact-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { MailService } from '../mail/mail.service';
import { EmailTemplatesService } from '../email-templates/email-templates.service';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadsRepo: MongoRepository<Lead>,
    private readonly mailService: MailService,
    private readonly emailTemplatesService: EmailTemplatesService,
  ) {}

  /**
   * Create a new lead from the hero form submission.
   * Sends a confirmation email automatically.
   */
  async create(dto: CreateLeadDto): Promise<Lead> {
    const lead = this.leadsRepo.create({
      ...dto,
      status: 'new',
      statusHistory: [{ status: 'new', updatedAt: new Date() }],
    });
    const saved = await this.leadsRepo.save(lead);

    // Send confirmation email (non-blocking)
    this.mailService.sendLeadConfirmation({ to: saved.email, name: saved.name });

    return saved;
  }

  /**
   * Retrieve leads with pagination, search, filtering, and sorting
   */
  async findAll(query: QueryLeadsDto): Promise<{ data: Lead[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, status, sortField = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const [data, total] = await this.leadsRepo.findAndCount({
      where: filter,
      skip,
      take: limit,
      order: { [sortField]: sortOrder.toUpperCase() as 'ASC' | 'DESC' } as any,
    });

    return { data, total, page, limit };
  }

  /**
   * Find a single lead by id
   */
  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadsRepo.findOneBy({ _id: new ObjectId(id) });
    if (!lead) throw new NotFoundException(`Lead #${id} not found`);
    return lead;
  }

  /**
   * Update the status of a lead and record in history
   */
  async updateStatus(id: string, dto: UpdateLeadStatusDto, updatedBy?: string): Promise<Lead> {
    const lead = await this.findOne(id);
    const history = Array.isArray(lead.statusHistory) ? lead.statusHistory : [];
    history.push({ status: dto.status, updatedAt: new Date(), updatedBy });
    lead.statusHistory = history;
    lead.status = dto.status;
    return this.leadsRepo.save(lead);
  }

  /**
   * Contact the lead via email.
   * The replyTo is set to the admin's email.
   * Optionally saves the message as a named template.
   */
  async contactLead(id: string, dto: ContactLeadDto, adminEmail: string): Promise<{ message: string }> {
    const lead = await this.findOne(id);

    await this.mailService.sendContactEmail({
      to: lead.email,
      toName: lead.name,
      subject: dto.subject,
      html: dto.body,
      replyTo: adminEmail,
    });

    // If the admin wants to save this as a reusable template
    if (dto.saveAsTemplateName) {
      await this.emailTemplatesService.create({
        name: dto.saveAsTemplateName,
        subject: dto.subject,
        body: dto.body,
      });
    }

    return { message: `Email sent to ${lead.email}` };
  }
}
