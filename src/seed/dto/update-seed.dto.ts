import { PartialType } from '@nestjs/swagger';
import { CreateSeedDto } from './create-seed.dto';

// DTO para la actualización de datos de seed
export class UpdateSeedDto extends PartialType(CreateSeedDto) {}
