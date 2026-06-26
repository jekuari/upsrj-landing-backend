import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { ApiKeyService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';

@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @Auth([])
  async create(@GetUser() user: User, @Body() createDto: CreateApiKeyDto) {
    return await this.apiKeyService.create(user.id.toString(), createDto);
  }

  @Get()
  @Auth([])
  async findAll(@GetUser() user: User) {
    return await this.apiKeyService.findAll(user.id.toString());
  }

  @Delete(':id')
  @Auth([])
  async remove(@GetUser() user: User, @Param('id') id: string) {
    return await this.apiKeyService.remove(user.id.toString(), id);
  }
}
