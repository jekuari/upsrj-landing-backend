import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { PuckComponent } from './entities/puck-component.entity';
import { CreatePuckComponentDto } from './dto/create-puck-component.dto';
import { UpdatePuckComponentDto } from './dto/update-puck-component.dto';
import { ObjectId } from 'mongodb';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class PuckComponentsService {
  constructor(
    @InjectRepository(PuckComponent)
    private readonly puckRepository: MongoRepository<PuckComponent>,
  ) {}

  private getDbSlug(slug: string): string {
    return slug === '_index' ? '' : (slug || '');
  }

  /**
   * Creates a new Puck component
   * @param dto The data transfer object containing component details
   * @returns The newly created component
   */
  async create(dto: CreatePuckComponentDto) {
    // const slug = this.slugify(dto.slug || dto.root?.props?.title || '');

    // Eliminar _id si viene en el DTO para evitar conflictos
    const { _id, ...restDto } = dto as any;
    const dbSlug = this.getDbSlug(dto.slug || '');

    const exists = await this.puckRepository.findOneBy({ slug: dbSlug });
    if (exists) {
      return this.update(dbSlug, restDto);
    }

    return this.puckRepository.save({ ...restDto, slug: dbSlug });
  }

  /**
   * Retrieves all Puck components with pagination
   * @param paginationDto Optional pagination parameters (limit, offset)
   * @returns Array of Puck components based on pagination settings
   */
  async findAll(paginationDto?: PaginationDto) {
    const { limit = 10000, offset = 0 } = paginationDto || {};

    return await this.puckRepository.find({
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
    const dbSlug = this.getDbSlug(slug);
    const component = await this.puckRepository.findOneBy({ slug: dbSlug });
    console.log('component found:', component, dbSlug);
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
  async update(slug: string, dto: UpdatePuckComponentDto) {
    const dbSlug = this.getDbSlug(slug);
    const existing = await this.findOne(dbSlug); // lanza error si no existe
    
    const updatedDto = { ...dto };
    if (updatedDto.slug !== undefined) {
      updatedDto.slug = this.getDbSlug(updatedDto.slug);
    }
    const updated = Object.assign(existing, updatedDto);
    return await this.puckRepository.save(updated);
  }

  /**
   * Removes a Puck component from the database
   * @param slug The unique identifier of the component to delete
   */
  async remove(slug: string) {
    const dbSlug = this.getDbSlug(slug);
    if (dbSlug === '') {
      throw new BadRequestException('No se puede eliminar la página de inicio');
    }
    const component = await this.findOne(dbSlug); // lanza error si no existe
    await this.puckRepository.remove(component);
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
