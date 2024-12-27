import { Injectable } from '@nestjs/common';
import { CreateSeedDto } from './dto/create-seed.dto';
import { UpdateSeedDto } from './dto/update-seed.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { system_module } from '../permission/entities/systemModule.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(system_module)
    private readonly systemModuleRepository: Repository<system_module>
  ){}

  async executeSeed(){
    const modules = [
      { module_name: 'Authentication '},
      { module_name: 'permission'},
    ];
    // Verifica si ya existen módulos, para no duplicar
    const existingModules = await this.systemModuleRepository.find();
    if (existingModules.length === 0) {
      // Si no hay módulos existentes, crea los nuevos
      const createdModules = this.systemModuleRepository.create(modules);
      await this.systemModuleRepository.save(createdModules);
      return 'Módulos creados exitosamente.';
    } else {
      return 'Los módulos ya existen en la base de datos.';
    }
    
  }
  
}
