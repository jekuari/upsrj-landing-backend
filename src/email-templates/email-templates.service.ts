import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { EmailTemplate } from './entities/email-template.entity';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@Injectable()
export class EmailTemplatesService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly repo: MongoRepository<EmailTemplate>,
  ) {}

  async create(dto: CreateEmailTemplateDto): Promise<EmailTemplate> {
    const template = this.repo.create(dto);
    return this.repo.save(template);
  }

  async findAll(): Promise<EmailTemplate[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } as any });
  }

  async findOne(id: string): Promise<EmailTemplate> {
    const template = await this.repo.findOneBy({ _id: new ObjectId(id) });
    if (!template) throw new NotFoundException(`Email template #${id} not found`);
    return template;
  }

  async update(id: string, dto: UpdateEmailTemplateDto): Promise<EmailTemplate> {
    const existing = await this.findOne(id);
    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOne(id);
    await this.repo.remove(existing);
  }
}
