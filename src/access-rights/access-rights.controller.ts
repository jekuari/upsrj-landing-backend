import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AccessRightsService } from './access-rights.service';
import { CreateAccessRightDto } from './dto/create-access-right.dto';
import { UpdateAccessRightDto } from './dto/update-access-right.dto';
import { ApiResponse } from '@nestjs/swagger';

// Controlador que maneja las solicitudes HTTP relacionadas con los derechos de acceso
@Controller('access-rights')
export class AccessRightsController {
  constructor(private readonly accessRightsService: AccessRightsService) {}

  @ApiResponse({ status: 200, description: 'Request successful'})
  @Get('getPermission/:userId')
  findOne(@Param('userId') UserId: string, @Query('module') moduleName: string) {
    return this.accessRightsService.findOne(UserId, moduleName);
  }

  @ApiResponse({ status: 200, description: 'Request successful'})
  @Get('getPermissions/:userId')
  findAll(@Param('userId') UserId: string) {
    return this.accessRightsService.findAll(UserId);
  }

  @Patch('updatePermissions/:userId')
  update(@Param('userId') UserId: string, @Query('module') moduleName: string, @Body() updateAccessRightDto: UpdateAccessRightDto) {
    return this.accessRightsService.update(UserId, moduleName, updateAccessRightDto);
  }

  @Patch('removePermissions/:id')
  remove(@Param('id') id: string) {
    return this.accessRightsService.remove(id);
  }
}
