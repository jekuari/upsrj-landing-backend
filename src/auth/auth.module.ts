import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { InviteToken } from './entities/invite-token.entity';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserPermissionGuard } from './guards/user-permission.guard';
import { Role } from './entities/role.entity';
import { MailModule } from '../mail/mail.module';
import { RolesModule } from './roles/roles.module';

@Module({
  controllers: [AuthController],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Role, InviteToken]),
    MailModule,
    RolesModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log(`Secret Jwt: ${configService.get('JWT_SECRET')}`);
        console.log(`Secret Jwt: ${process.env.JWT_SECRET}`);
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '24h',
          },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    UserPermissionGuard,
  ],
  exports: [
    TypeOrmModule,
    AuthService,
    JwtStrategy,
    PassportModule,
    JwtModule,
    UserPermissionGuard,
  ],
})
export class AuthModule {}
