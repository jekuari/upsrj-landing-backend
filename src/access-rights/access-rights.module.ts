import { forwardRef, Module } from '@nestjs/common';
import { AccessRightsService } from './access-rights.service';
import { AccessRightsController } from './access-rights.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessRight } from './entities/access-right.entity';
import { SystemModule } from './entities/system-module.entity';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';

// Modulo que gestiona los derechos de acceso y permisos de los usuarios
@Module({
  imports:[
    forwardRef(() => AuthModule), // Importa el módulo de autenticación para verificar el estado del usuario
    TypeOrmModule.forFeature([AccessRight,SystemModule]) // Registra las entidades AccessRight y SystemModule en TypeORM
  ],
  controllers: [AccessRightsController], // Controlador que maneja las solicitudes HTTP relacionadas con los derechos de acceso
  providers: [AccessRightsService], // Proveedores de servicios para gestionar la lógica de negocio
  exports:[TypeOrmModule, AccessRightsService] // Exporta TypeOrmModule y AccessRightsService para ser utilizados en otros módulos
})
export class AccessRightsModule {}
