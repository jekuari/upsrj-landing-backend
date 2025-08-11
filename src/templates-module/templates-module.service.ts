import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { UpdateTemplatesModuleDto } from './dto/update-templates-module.dto';
import { ObjectId } from 'mongodb';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { TemplatesComponent } from './entities/templates-module.entity';
import { CreateTemplatesModuleDto } from './dto/create-templates-module.dto';

@Injectable()
export class TemplatesModuleService {
  constructor(
    @InjectRepository(TemplatesComponent)
    private readonly templatesRepository: MongoRepository<TemplatesComponent>,
  ) {}

  /**
   * Creates a new Templates Module
   * @param dto The data transfer object containing module details
   * @returns The newly created module
   */
  async create(dto: CreateTemplatesModuleDto) {
    // const slug = this.slugify(dto.slug || dto.root?.props?.title || '');

    // Eliminar _id si viene en el DTO para evitar conflictos
    const { _id, ...restDto } = dto as any;

    const exists = await this.templatesRepository.findOneBy({ slug: dto.slug });
    if (exists) {
      return this.update(exists.slug, restDto);
    }

    return this.templatesRepository.save({ ...restDto, slug: dto.slug });
  }

  /**
   * Retrieves all Templates Modules with pagination
   * @param paginationDto Optional pagination parameters (limit, offset)
   * @returns Array of Puck components based on pagination settings
   */
  async findAll(paginationDto?: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto || {};

    return await this.templatesRepository.find({
      take: limit,
      skip: offset,
    });
  }

  /**
   * Finds a specific Puck component by ID
   * @param id The unique identifier of the component
   * @returns The found component or throws NotFoundException
   */
  async findOne(slug: string) {
    const component = await this.templatesRepository.findOneBy({ slug: slug });
    console.log('component found:', component, slug);
    if (!component) {
      throw new NotFoundException(`Component with id "${slug}" not found`);
    }
    return component;
  }

  /**
   * Updates an existing Puck component
   * @param slug The unique identifier of the component to update
   * @param dto The data transfer object with updated fields
   * @returns The updated component
   */
  async update(slug: string, dto: UpdateTemplatesModuleDto) {
    const existing = await this.findOne(slug); // lanza error si no existe
    const updated = Object.assign(existing, dto);
    return await this.templatesRepository.save(updated);
  }

  /**
   * Removes a Templates Module from the database
   * @param slug The unique identifier of the module to delete
   */
  async remove(slug: string) {
    const component = await this.findOne(slug); // lanza error si no existe
    await this.templatesRepository.remove(component);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quita acentos
      .replace(/[^\w\s-]/g, '') // quita símbolos
      .replace(/\s+/g, '-') // reemplaza espacios por guiones
      .replace(/--+/g, '-'); // evita múltiples guiones seguidos
  }
}
