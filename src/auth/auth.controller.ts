import { Controller, Get, Post, Body, Param, Patch, Delete, ParseUUIDPipe} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto, UpdateUserStatusDto } from './dto';
import { User } from './entities/user.entity';
import { GetUser } from './decorators/get-user.decorator';
import { ApiResponse } from '@nestjs/swagger';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ status: 201, description: 'User was created successfully', type: CreateUserDto})
  @ApiResponse({ status: 400, description: 'Bad request due to invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related issues' })
  @Post('register')
  createUser(@Body() createUserDto:CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @ApiResponse({ status: 201, description: 'User logged in', type: LoginUserDto})
  @ApiResponse({ status: 400, description: 'Bad request due to invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related issues' })
  @Post('login')
  loginUser(@Body() loginUserDto:LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

 // Gestion de usuarios (woods)

  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @Patch(':id')
  async updateUser(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateUserDto: UpdateUserDto,
  ) {
      return this.authService.updateUser(id, updateUserDto);
  }

  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @Patch(':id/status')
  async updateUserStatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
      return this.authService.updateUserStatus(id, updateUserStatusDto);
  }

  @ApiResponse({ status: 200, description: 'User soft deleted successfully' })
  @Patch(':id/soft-delete')
  async softDeleteUser(@Param('id', ParseUUIDPipe) id: string) {
      return this.authService.softDeleteUser(id);
  }

  @ApiResponse({ status: 200, description: 'User permanently deleted successfully' })
  @Delete(':id')
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
      await this.authService.deleteUser(id);
      return { message: 'User permanently deleted successfully' };
  }

}
