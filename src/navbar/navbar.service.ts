import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { NavbarConfig, NavbarItem } from './entities/navbar.entity';
import { SaveNavbarDto } from './dto/save-navbar.dto';

@Injectable()
export class NavbarService {
  constructor(
    @InjectRepository(NavbarConfig)
    private readonly navbarRepository: MongoRepository<NavbarConfig>,
  ) {}

  /**
   * Returns the default hardcoded configuration of the navbar.
   * This matches the historical static navbar contents.
   */
  private getDefaultConfig(): Partial<NavbarConfig> {
    const mainLinks: NavbarItem[] = [
      { id: 'default_main_1', label: 'Acerca De', url: '/acerca-de' },
      { id: 'default_main_2', label: 'Oferta Académica', url: '/oferta' },
      { id: 'default_main_3', label: 'Blog', url: '/blog' },
    ];

    const soyCoyoteLinks: NavbarItem[] = [
      { id: 'default_sc_1', label: 'Portal de Maestros', url: 'https://sai.upsrj.edu.mx/docentes.php' },
      { id: 'default_sc_2', label: 'Portal de Alumnos (SAI)', url: 'https://sai.upsrj.edu.mx/alumnos.php' },
      { id: 'default_sc_3', label: 'Portal de Egresados', url: 'https://sai.upsrj.edu.mx/egresados.php' },
      { id: 'default_sc_4', label: 'Portal de Administrativos', url: '/admin' },
      { id: 'default_sc_5', label: 'Biblioteca Virtual', url: 'https://elibro.net/es/lc/upsrj/login_usuario/?next=/es/lc/upsrj/inicio/' },
      { id: 'default_sc_6', label: 'Sistema de Recursos Administrativos', url: 'http://131.196.245.78/SADMIN/Account/Login?ReturnUrl=%2fSADMIN%2f' },
    ];

    return { mainLinks, soyCoyoteLinks };
  }

  /**
   * Retrieves the active navbar configuration.
   * If none exists in the DB, it creates and saves the default configuration.
   */
  async getNavbarConfig(): Promise<NavbarConfig> {
    const [config] = await this.navbarRepository.find();
    if (!config) {
      const defaultData = this.getDefaultConfig();
      return await this.navbarRepository.save(defaultData);
    }
    return config;
  }

  /**
   * Updates/Saves the single navbar configuration.
   */
  async saveNavbarConfig(dto: SaveNavbarDto): Promise<NavbarConfig> {
    const [existing] = await this.navbarRepository.find();
    if (existing) {
      existing.mainLinks = dto.mainLinks;
      existing.soyCoyoteLinks = dto.soyCoyoteLinks;
      return await this.navbarRepository.save(existing);
    } else {
      return await this.navbarRepository.save(dto);
    }
  }
}
