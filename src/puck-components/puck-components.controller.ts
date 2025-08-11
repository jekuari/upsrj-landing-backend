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
import { PuckComponentsService } from './puck-components.service';
import { CreatePuckComponentDto } from './dto/create-puck-component.dto';
import { UpdatePuckComponentDto } from './dto/update-puck-component.dto';
import { PuckComponent } from './entities/puck-component.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth } from 'src/auth/decorators';

@ApiTags('Puck Components')
@ApiBearerAuth('JWT-auth')
@Controller('puck-components')
export class PuckComponentsController {
  constructor(private readonly puckComponentsService: PuckComponentsService) {}

  @ApiOperation({ summary: 'Crear un nuevo componente' })
  @ApiResponse({
    status: 201,
    description: 'Componente creado exitosamente',
    type: PuckComponent,
  })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  @Auth([{ module: 'Puck', permission: 'canCreate' }])
  @Post()
  async create(
    @Body() createPuckComponentDto: CreatePuckComponentDto,
  ): Promise<PuckComponent> {
    return this.puckComponentsService.create(createPuckComponentDto);
  }

  @ApiOperation({ summary: 'Obtener todos los componentes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los componentes',
    type: [PuckComponent],
  })
  @ApiResponse({ status: 500, description: 'Error en el servidor' })
  @Auth([{ module: 'Puck', permission: 'canRead' }])
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PuckComponent[]> {
    return this.puckComponentsService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Obtener un componente por su ID' })
  @ApiResponse({
    status: 200,
    description: 'Componente encontrado',
    type: PuckComponent,
  })
  @ApiResponse({ status: 404, description: 'Componente no encontrado' })
  @Get(':slug')
  @Auth([{ module: 'Puck', permission: 'canRead' }])
  async findOne(@Param('slug') slug: string): Promise<PuckComponent> {
    // convert from url string to regular string
    console.log('received request for slug:', slug);
    const slugString = decodeURIComponent(slug);
    return this.puckComponentsService.findOne(slugString);
  }

  @ApiOperation({ summary: 'Actualizar un componente existente' })
  @ApiResponse({
    status: 200,
    description: 'Componente actualizado',
    type: PuckComponent,
  })
  @ApiResponse({ status: 400, description: 'Datos de actualización inválidos' })
  @ApiResponse({ status: 404, description: 'Componente no encontrado' })
  @Auth([{ module: 'Puck', permission: 'canUpdate' }])
  @Patch(':slug')
  async update(
    @Param('slug') slug: string,
    @Body() updatePuckComponentDto: UpdatePuckComponentDto,
  ): Promise<PuckComponent> {
    const slugString = decodeURIComponent(slug);
    return this.puckComponentsService.update(slugString, updatePuckComponentDto);
  }

  @ApiOperation({ summary: 'Eliminar un componente por su slug' })
  @ApiResponse({
    status: 200,
    description: 'Componente eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Componente no encontrado' })
  @Auth([{ module: 'Puck', permission: 'canDelete' }])
  @Delete(':slug')
  async remove(@Param('slug') slug: string): Promise<void> {
    const slugString = decodeURIComponent(slug);
    return this.puckComponentsService.remove(slugString);
  }
}
