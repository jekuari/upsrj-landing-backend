// src/images/images.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GridFSBucket } from 'mongodb';

import { Image } from './entities/image.entity';
import { ImagesService } from './image.service';
import { ImagesController } from './image.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AccessRightsModule } from 'src/access-rights/access-rights.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image]),        // 👈 tu entidad
    AuthModule, AccessRightsModule,            // 👈 el módulo de autenticación y derechos de acceso
  ],
  providers: [
    ImagesService,
    {
      provide: 'GRIDFS_BUCKET',
      useFactory: (dataSource: DataSource) => {
        const db = (dataSource.driver as any).queryRunner
          .databaseConnection.db(dataSource.options.database);
        return new GridFSBucket(db, { bucketName: 'images' });
      },
      inject: [DataSource],
    },
  ],
  controllers: [ImagesController],
  exports: [ImagesService],                   // 👈 no exportes el bucket
})
export class ImageModule {}
