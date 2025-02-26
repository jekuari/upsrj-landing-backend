import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs';  
import { MongoRepository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt.payload.interface';
import { AccessRightsService } from '../access-rights/access-rights.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class AuthService {
  constructor( 
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,  // Cambio a MongoRepository para compatibilidad con MongoDB
    @Inject(forwardRef(() => AccessRightsService))
    private readonly accessRightsService:AccessRightsService, 
    private readonly jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
  
      // Hash de la contraseña usando bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Crear la instancia del usuario con valores predeterminados para propiedades ausentes en el DTO
      const user = this.userRepository.create({
        ...userData,
        password: hashedPassword,
        isActive: true,  // Se establece el valor predeterminado manualmente
      });
  
      // Guardar el usuario en la base de datos
      const newUser =  await this.userRepository.save(user);
      
      await this.accessRightsService.createPermission(user);
      // Eliminar datos sensibles antes de retornar
      delete newUser.password;
  
      return {
        ...newUser,
        token: this.getJwtToken({ id: newUser.id.toString() }),  // Convertir ObjectId a string
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }
  

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id.toString() })  // Convierte ObjectId a string
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const mailLowerCase = email.toLowerCase().trim();
    
    // Buscar el usuario y seleccionar solo el correo y la contraseña
    const user = await this.userRepository.findOne({
        where: { email: mailLowerCase },
        select: { email: true, password: true, id: true },
    });
    
    // Verificar si el usuario existe
    if (!user || !user.isActive) {
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
      email: user.email,
      fullName: user.fullName,
      matricula: user.matricula,
      token: this.getJwtToken({ id: user.id.toString() })  // Convierte ObjectId a string
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code === 11000) {  // MongoDB duplicate key error code
      throw new BadRequestException('Duplicate entry detected');
    }

    console.error(error);
    throw new InternalServerErrorException('Please check server logs');
  }

  async UpdateUsers(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const query = ObjectId.isValid(id)
        ? { _id: new ObjectId(id), }
        : { matricula: id};

      const user = await this.userRepository.findOne({ where: query });

      if (!user || !user.isActive) {
        throw new NotFoundException('The user is not found or inactive');
      }

      // Si se incluye una nueva contraseña, la encripta antes de actualizar
      if (updateUserDto.password) {
        const salt = await bcrypt.genSalt(10);
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
      }
      
      await this.userRepository.update(user.id, updateUserDto);

      // Retornar el usuario actualizado
      return await this.userRepository.findOneBy({ _id: new ObjectId(user.id) });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Mantiene el código de error original
      }
      
      throw new InternalServerErrorException('Unexpected error updating user');
    }
  }
  
  async desactiveUsers(id: string) {
    try {
      const query = ObjectId.isValid(id)
        ? { _id: new ObjectId(id), /*isActive: true*/ }
        : { matricula: id};

      const user = await this.userRepository.findOne({ where: query });

      if (!user) {
        throw new NotFoundException('The user is not found');
      }

      if (!user.isActive) {
        throw new BadRequestException('The user is already deactivated');
      }

      const updateResult = await this.userRepository.findOneAndUpdate(
        { _id: user.id },
        { $set: { isActive: false } },
        { returnDocument: 'after' }
      );

      if (!updateResult) {
        throw new InternalServerErrorException('Failed to update user');
      }

      await this.accessRightsService.remove(id);

      return updateResult;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error; // Mantiene el código de error original
      }
      
      throw new InternalServerErrorException('Unexpected error updating user');
      
    }
  }

  async reactiveUser(id: string) {
    try {
      const query = ObjectId.isValid(id)
        ? { _id: new ObjectId(id), /*isActive: false*/ }
        : { matricula: id};

      const user = await this.userRepository.findOne({ where: query });

      if (!user) {
        throw new NotFoundException('The user is not found');
      }

      if (user.isActive) {
        throw new BadRequestException('The user is already active');
      }

      const updateResult = await this.userRepository.findOneAndUpdate(
        { _id: user.id },
        { $set: { isActive: true } },
        { returnDocument: 'after' }
      );

      if (!updateResult) {
        throw new InternalServerErrorException('Failed to update user');
      }

      return updateResult;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error; // Mantiene el código de error original
      }
      
      throw new InternalServerErrorException('Unexpected error updating user');
      
    }
  }


  //Obtener todos los usuarios con paginacion de 10 en 10
  async findAll( paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    const user = await this.userRepository.find({
      take: limit,
      skip: offset
    });

    //Retornar los usuarios sin la contraseña
    return user.map(({ password, ...userData }) => userData);
  }

  async checkUserStatus(id: string) {
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) }, 
    });

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found or inactive');
    }

    return user;
  }
}


