import { Controller, Get, Put, Body } from '@nestjs/common';
import { NavbarService } from './navbar.service';
import { SaveNavbarDto } from './dto/save-navbar.dto';
import { NavbarConfig } from './entities/navbar.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators';

@ApiTags('Navbar')
@Controller('navbar')
export class NavbarController {
  constructor(private readonly navbarService: NavbarService) {}

  @ApiOperation({ summary: 'Obtener la configuración actual de la barra de navegación' })
  @ApiResponse({
    status: 200,
    description: 'Configuración recuperada exitosamente',
    type: NavbarConfig,
  })
  @Get()
  async getNavbar(): Promise<NavbarConfig> {
    return this.navbarService.getNavbarConfig();
  }

  @ApiOperation({ summary: 'Actualizar la configuración de la barra de navegación' })
  @ApiResponse({
    status: 200,
    description: 'Configuración guardada exitosamente',
    type: NavbarConfig,
  })
  @ApiBearerAuth('JWT-auth')
  @Auth([{ module: 'Navbar', permission: 'canUpdate' }])
  @Put()
  async saveNavbar(@Body() saveNavbarDto: SaveNavbarDto): Promise<NavbarConfig> {
    return this.navbarService.saveNavbarConfig(saveNavbarDto);
  }
}
