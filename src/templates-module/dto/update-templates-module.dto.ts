import { PartialType } from '@nestjs/swagger';
import { CreateTemplatesModuleDto } from './create-templates-module.dto';

export class UpdateTemplatesModuleDto extends PartialType(CreateTemplatesModuleDto) {}

/**
 * Data Transfer Object for updating an existing Templates Module
 * 
 * Extends CreateTemplatesModuleDto as a PartialType, making all properties optional
 * This allows for partial updates of module properties
 */