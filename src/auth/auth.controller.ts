import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata, Query} from '@nestjs/common';
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
  async userStatus(@Param('id') id: string) {
    return this.authService.desactiveUsers(id);
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

}
