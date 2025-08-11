import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogComponentDto } from './dto/create-blog.dto';
import { UpdateBlogComponentDto } from './dto/update-blog.dto';
import { BlogComponent } from './entities/blog.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth } from 'src/auth/decorators';

@ApiTags('Blogs')
@ApiBearerAuth('JWT-auth')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @ApiOperation({ summary: 'Crear una nueva entrada de blog' })
  @ApiResponse({
    status: 201,
    description: 'Blog creado exitosamente',
    type: BlogComponent,
  })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  @Auth([{ module: 'Blog', permission: 'canCreate' }])
  @Post()
  async create(@Body() dto: CreateBlogComponentDto): Promise<BlogComponent> {
    return this.blogService.create(dto);
  }

  @ApiOperation({ summary: 'Obtener todos los blogs' })
  @ApiResponse({
    status: 200,
    description: 'Lista de blogs',
    type: [BlogComponent],
  })
  @ApiResponse({ status: 500, description: 'Error en el servidor' })
  @Auth([{ module: 'Blog', permission: 'canRead' }])
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<BlogComponent[]> {
    return this.blogService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Obtener un blog por su slug' })
  @ApiResponse({
    status: 200,
    description: 'Blog encontrado',
    type: BlogComponent,
  })
  @ApiResponse({ status: 404, description: 'Blog no encontrado' })
  @Auth([{ module: 'Blog', permission: 'canRead' }])
  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<BlogComponent> {
    const slugString = decodeURIComponent(slug);
    return this.blogService.findOne(slugString);
  }

  @ApiOperation({ summary: 'Actualizar un blog existente' })
  @ApiResponse({
    status: 200,
    description: 'Blog actualizado',
    type: BlogComponent,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Blog no encontrado' })
  @Auth([{ module: 'Blog', permission: 'canUpdate' }])
  @Patch(':slug')
  async update(
    @Param('slug') slug: string,
    @Body() dto: UpdateBlogComponentDto,
  ): Promise<BlogComponent> {
    const slugString = decodeURIComponent(slug);
    return this.blogService.update(slugString, dto);
  }

  @ApiOperation({ summary: 'Eliminar un blog por su slug' })
  @ApiResponse({
    status: 200,
    description: 'Blog eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Blog no encontrado' })
  @Auth([{ module: 'Blog', permission: 'canDelete' }])
  @Delete(':slug')
  async remove(@Param('slug') slug: string): Promise<void> {
    const slugString = decodeURIComponent(slug);
    return this.blogService.remove(slugString);
  }
}
