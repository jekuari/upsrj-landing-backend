import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata, Query, ParseBoolPipe} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { get, request } from 'http';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { GetUser } from './decorators/get-user.decorator';
import { Auth } from './decorators/auth.decorator';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UserRoleGuard } from './guards/user-role.guard';
import { META_MODULES, META_PERMISSIONS } from './decorators';
import { ValidModules, ValidPermissions } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ status: 201, description: 'User was found successfully'})
  @Get('getUsers')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.authService.findAll(paginationDto);
  }

  @ApiResponse({ status: 201, description: 'User was created successfully', type: CreateUserDto})
  @ApiResponse({ status: 400, description: 'Bad request due to invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related issues' })
  @Post('register')
  createUser(@Body() createUserDto:CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @ApiResponse({ status: 201, description: 'User logged in', type: LoginUserDto})
  @ApiResponse({ status: 400, description: 'Unauthorized due to mismatching credentials' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related issues' })
  @Post('login')
  loginUser(@Body() loginUserDto:LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @ApiResponse({ status: 201, description: 'Request successful. User was update successfully', type: UpdateUserDto})
  @ApiResponse({ status: 403, description: 'Forbidden. Token related issues'})
  @ApiResponse({ status: 404, description: 'User not found'})
  @ApiResponse({ status: 500, description: 'Internal server error'})
  @Patch('updateUser/:id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto:UpdateUserDto
  ){
    return this.authService.UpdateUsers(id , updateUserDto);
  }


  @Patch('disable/:id')
  @ApiOperation({ summary: 'Disable a user', description: 'Disables a user by their unique ID.'})
  @ApiParam({ name: 'id', required: true, description: 'Unique identifier of the user', example: '65d5c1ab2f4f4d3e9c8b4567'})
  @ApiResponse({ status: 200, description: 'Request successful. User disabled successfully'})
  @ApiResponse({ status: 404, description: 'User not found'})
  @ApiResponse({ status: 400, description: 'User already deactivated'})
  async disableUser(@Param('id') id: string) {
    return this.authService.desactiveUsers(id);
  }

  @Patch('enable/:id')
  @ApiOperation({ summary: 'Enable a user', description: 'Enables a user by their unique ID.'})
  @ApiParam({ name: 'id', required: true, description: 'Unique identifier of the user', example: '65d5c1ab2f4f4d3e9c8b4567'})
  @ApiResponse({ status: 200, description: 'Request successful. User enabled successfully'})
  @ApiResponse({ status: 404, description: 'User not found'})
  @ApiResponse({ status: 400, description: 'User already active'})
  async enableUser(@Param('id') id: string) {
    return this.authService.reactiveUser(id);
  }


  @ApiResponse({ status: 201, description: 'User check-status', type: User})
  @ApiResponse({ status: 400, description: 'Bad request due to invalid input' })
  @ApiResponse({ status: 401, description: 'User not found (request)' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related issues' })
  @Get('check-status')
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.checkAuthStatus(user)
  }

  //Prueba (Get user 'isActive' status)
  @Get('status/:id')
  checkStatus(@Param('id') id: string){
    return this.authService.checkUserStatus(id)
  }

  //Prueba (rutas privadas)
  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    //@Req() request: Express.Request
    @GetUser() user: User,
    @GetUser('isActive') userStatus: boolean
  ){
    return {
      ok: true,
      message: 'This is a private route',
      user,
      userStatus
    }
  }

  //Prueba (rutas privadas)
  @Get('private2')
  @SetMetadata(META_PERMISSIONS, ['canRead', 'canUpdate'])
  @SetMetadata(META_MODULES, ['Authentication', 'Permission'])
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivateRoute2(
    @GetUser() user: User
  ){
    return {
      ok: true,
      message: 'This is a private route',
      user
    }
  }

  @Get('private3')
  @Auth([ValidPermissions.canCreate, ValidPermissions.canDelete], [ValidModules.Authentication, ValidModules.Permission])
  testingPrivateRoute3(
    @GetUser() user: User
  ){
    return {
      ok: true,
      message: 'This is a private route',
      user
    }
  }
}