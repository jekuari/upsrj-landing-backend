import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { MongoRepository } from 'typeorm';
import { User } from './entities/user.entity';
import { InviteToken } from './entities/invite-token.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt.payload.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ObjectId } from 'mongodb';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
    @InjectRepository(InviteToken)
    private readonly inviteTokenRepo: MongoRepository<InviteToken>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async createSeed(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
  
    if (!password) {
      throw new Error('Password is missing in createSeed()');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      isActive: true,
      roles: ['role:admin'],
      permissions: [],
    });
  
    const newUser = await this.userRepository.save(user);
  
    delete newUser.password;
  
    return {
      ...newUser,
      token: this.getJwtToken({ id: newUser.id.toString() }),
    };
  }
  
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = this.userRepository.create({
        ...userData,
        password: hashedPassword,
        isActive: true,
        roles: ['role:viewer'],
        permissions: [],
      });
  
      const newUser =  await this.userRepository.save(user);
      
      delete newUser.password;
  
      return {
        ...newUser,
        token: this.getJwtToken({ id: newUser.id.toString() }),
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

  // Cambiar el estado de un usuario (activo/inactivo)
  async toggleUserStatus(id: string) {
    try {
      const query = ObjectId.isValid(id)
        ? { _id: new ObjectId(id) }
        : { matricula: id };
  
      const user = await this.userRepository.findOne({ where: query });
  
      if (!user) {
        throw new NotFoundException('The user is not found');
      }
  
      const newStatus = !user.isActive;
  
      const updateResult = await this.userRepository.findOneAndUpdate(
        { _id: user.id },
        { $set: { isActive: newStatus } },
        { returnDocument: 'after' }
      );
  
      if (!updateResult) {
        throw new InternalServerErrorException('Failed to update user');
      }
  
      return { isActive: updateResult.isActive };
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
    const query = ObjectId.isValid(id)
        ? { _id: new ObjectId(id) }
        : { matricula: id };

    const user = await this.userRepository.findOne({ where: query });
    if (!user || !user.isActive) {
      throw new NotFoundException('User not found or inactive');
    }
    return user;
  }

  async createAndInvite(dto: Partial<CreateUserDto> & { permissions?: string[]; roles?: string[] }) {
    const { permissions = [], roles = ['role:viewer'], ...userData } = dto;

    const user = this.userRepository.create({
      ...userData,
      password: 'PENDING',
      isActive: false,
      permissions,
      roles,
    });

    const newUser = await this.userRepository.save(user);

    const token = crypto.randomBytes(32).toString('hex');
    const inviteToken = this.inviteTokenRepo.create({
      token,
      userId: newUser.id,
      type: 'invite',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      createdAt: new Date(),
    });
    await this.inviteTokenRepo.save(inviteToken);

    await this.mailService.sendInviteEmail(newUser.email, token);

    delete newUser.password;
    return newUser;
  }

  async verifyInviteToken(token: string) {
    const inviteToken = await this.inviteTokenRepo.findOne({
      where: { token, type: 'invite', expiresAt: { $gt: new Date() } } as any,
    });
    if (!inviteToken) {
      throw new BadRequestException('Invalid or expired invite token');
    }
    return inviteToken;
  }

  async completeRegistration(token: string, password: string) {
    const inviteToken = await this.verifyInviteToken(token);
    const user = await this.userRepository.findOne({ where: { _id: inviteToken.userId } as any });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.isActive = true;
    await this.userRepository.save(user);
    await this.inviteTokenRepo.delete(inviteToken.id);

    delete user.password;
    return {
      ...user,
      token: this.getJwtToken({ id: user.id.toString() }),
    };
  }

  async requestPasswordReset(email: string) {
    const mailLowerCase = email.toLowerCase().trim();
    const user = await this.userRepository.findOne({ where: { email: mailLowerCase } });

    if (!user) {
      return { message: 'If the email exists, a reset code has been sent' };
    }

    await this.inviteTokenRepo.deleteMany({ userId: user.id, type: 'password_reset' } as any);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const inviteToken = this.inviteTokenRepo.create({
      token: otp,
      userId: user.id,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      createdAt: new Date(),
    });
    await this.inviteTokenRepo.save(inviteToken);

    await this.mailService.sendPasswordResetEmail(mailLowerCase, otp);

    return { message: 'If the email exists, a reset code has been sent' };
  }

  async verifyPasswordResetOtp(email: string, otp: string) {
    const mailLowerCase = email.toLowerCase().trim();
    const user = await this.userRepository.findOne({ where: { email: mailLowerCase } });
    if (!user) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const token = await this.inviteTokenRepo.findOne({
      where: { userId: user.id, type: 'password_reset', token: otp, expiresAt: { $gt: new Date() } } as any,
    });
    if (!token) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return { valid: true, tokenId: token.id.toString() };
  }

  async resetPassword(tokenId: string, newPassword: string) {
    const objectId = new ObjectId(tokenId);
    const token = await this.inviteTokenRepo.findOne({ where: { _id: objectId } as any });
    if (!token || token.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userRepository.findOne({ where: { _id: token.userId } as any });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);
    await this.inviteTokenRepo.delete(objectId);

    return { message: 'Password reset successfully' };
  }

  async deleteUser(id: string) {
    const query = ObjectId.isValid(id)
      ? { _id: new ObjectId(id) }
      : { matricula: id };

    const user = await this.userRepository.findOne({ where: query });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(user.id);
    return { message: 'User deleted successfully' };
  }

  async updateUserDetails(id: string, dto: { email?: string; fullName?: string; permissions?: string[]; roles?: string[] }) {
    const query = ObjectId.isValid(id)
      ? { _id: new ObjectId(id) }
      : { matricula: id };

    const user = await this.userRepository.findOne({ where: query });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email !== undefined) user.email = dto.email;
    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.permissions !== undefined) user.permissions = dto.permissions;
    if (dto.roles !== undefined) user.roles = dto.roles;

    await this.userRepository.save(user);

    delete user.password;
    return user;
  }
}


