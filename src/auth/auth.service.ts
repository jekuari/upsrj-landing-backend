import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';  
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto, UpdateUserDto, UpdateUserStatusDto } from './dto';
import { JwtPayload } from './interfaces/jwt.payload.interface';
import { PermissionService } from 'src/permission/permission.service';
import { UUID } from 'crypto';


@Injectable()
export class AuthService {
  constructor( 
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService:JwtService,
    private readonly permissionService: PermissionService
  ){}
  
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      
      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hashSync(password, 10);

      const user = this.userRepository.create({
        ...userData,
        password: hashedPassword  // Use the hashed password
      });

      await this.userRepository.save(user);


      //Crear sus permisos
      await this.permissionService.createPermission(user);
      delete user.password;

      
      const userReturn = await this.getUser(user.id);
      

      return {
        user: userReturn,
        //...user, con este no mandamos la informacion de permisos
        token: this.getJwtToken({id: user.id})
      };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    
    const mailLowerCase = email.toLowerCase().trim();
    // Buscar el usuario y seleccionar solo el correo y la contraseña
    const user = await this.userRepository.findOne({
        where: { email: mailLowerCase},
        select: {email: true, password: true, id:true },
    });
    
    // Verificar si el usuario existe
    if (!user) {
        throw new UnauthorizedException(`Credenciales incorrectas`);
    }
    
    // Comparar la contraseña proporcionada con la almacenada
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
        throw new UnauthorizedException(`Credenciales incorrectas`);
    }
    
    // Opcional: eliminar la contraseña del objeto usuario antes de retornarlo
    delete user.password;
    
    return {
      ...user,
      token: this.getJwtToken({id: user.id})
    }; // O puedes devolver un token de autenticación en lugar del usuario.
}

  async getUser(id:string){
    const user = this.userRepository.findOneBy({id});
    return user;
  };
  
  private getJwtToken(payload: JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.details);
    }

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }

  //Gestion de usuarios (woods)

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id, isDeleted: false } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found or has been deleted`);
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async updateUserStatus(id: string, updateUserStatusDto: UpdateUserStatusDto): Promise<User> {
      const user = await this.userRepository.findOne({ where: { id, isDeleted: false } });
      if (!user) {
      throw new NotFoundException(`User with ID ${id} not found or has been deleted`);
      }
      user.isActive = updateUserStatusDto.isActive;
      return this.userRepository.save(user);
  }

  async softDeleteUser(id: string): Promise<User> {
      const user = await this.userRepository.findOne({ where: { id, isDeleted: false } });
      if (!user) {
      throw new NotFoundException(`User with ID ${id} not found or already deleted`);
      }
      user.isDeleted = true;
      return this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
      }
      if (!user.isDeleted) {
      throw new BadRequestException(`User with ID ${id} must be soft deleted before permanent removal`);
      }
      await this.userRepository.delete(id);
  }

}
