import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { BlogComponent } from './entities/blog.entity';
import { CreateBlogComponentDto } from './dto/create-blog.dto';
import { UpdateBlogComponentDto } from './dto/update-blog.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogComponent)
    private readonly blogRepository: MongoRepository<BlogComponent>,
  ) {}

  /**
   * Creates a new Blog component
   * @param dto The data transfer object containing component details
   * @returns The newly created component
   */
  async create(dto: CreateBlogComponentDto) {
    // const slug = this.slugify(dto.slug || dto.root?.props?.title || '');

    // Eliminar _id si viene en el DTO para evitar conflictos
    const { _id, ...restDto } = dto as any;

    const exists = await this.blogRepository.findOneBy({ slug: dto.slug });
    if (exists) {
      return this.update(exists.slug, restDto);
    }

    return this.blogRepository.save({ ...restDto, slug: dto.slug });
  }

  /**
   * Retrieves all Blog components with pagination
   * @param paginationDto Optional pagination parameters (limit, offset)
   * @returns Array of Blog components based on pagination settings
   */
  async findAll(paginationDto?: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto || {};

    return await this.blogRepository.find({
      take: limit,
      skip: offset,
    });
  }

  /**
   * Finds a specific Blog component by ID
   * @param id The unique identifier of the component
   * @returns The found component or throws NotFoundException
   */
  async findOne(slug: string) {
    const blog = await this.blogRepository.findOneBy({ slug });
    console.log('component found:', blog, slug);
    if (!blog) {
      throw new NotFoundException(`Blog with slug "${slug}" not found`);
    }
    return blog;
  }

  /**
   * Updates an existing Blog component
   * @param slug The unique identifier of the component to update
   * @param dto The data transfer object with updated fields
   * @returns The updated component
   */
  async update(slug: string, dto: UpdateBlogComponentDto) {
    const existing = await this.findOne(slug); // lanza error si no existe
    const updated = Object.assign(existing, dto);
    return await this.blogRepository.save(updated);
  }

  /**
   * Removes a Blog component from the database
   * @param slug The unique identifier of the component to delete
   */
  async remove(slug: string) {
    const existing = await this.findOne(slug); // lanza error si no existe
    await this.blogRepository.remove(existing);
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
