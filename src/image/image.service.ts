// src/images/images.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GridFSBucket, ObjectId } from 'mongodb';
import * as sharp from 'sharp';

import { Image } from './entities/image.entity';

/**
 * Lógica de negocio para subir y descargar imágenes mediante GridFS.
 */
@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    @Inject('GRIDFS_BUCKET') private readonly bucket: GridFSBucket,
    @InjectRepository(Image) private readonly imageRepo: Repository<Image>,
  ) {}

  /**
   * Sube una imagen al bucket y persiste sus metadatos.
   * Devuelve la entidad resultante.
   */
  async upload(file: Express.Multer.File): Promise<Image> {
    if (!file?.buffer) {
      throw new BadRequestException('Archivo vacío');
    }

    // 1️⃣  Procesado opcional (resize / conversión):
    const processedBuffer = await sharp(file.buffer)
      .resize({ width: 800 })          // ajusta a tu gusto
      .toBuffer();

    const contentType = file.mimetype; // mantenemos MIME original

    // 2️⃣  Subida a GridFS:
    const uploadStream = this.bucket.openUploadStream(file.originalname, {
      contentType,
    });
    uploadStream.end(processedBuffer);

    const gridFsId: ObjectId = await new Promise((res, rej) => {
      uploadStream.on('finish', () => res(uploadStream.id));
      uploadStream.on('error', rej);
    });

    this.logger.verbose(`Imagen almacenada en GridFS => ${gridFsId}`);

    // 3️⃣  Persistimos metadatos:
    const image = this.imageRepo.create({
      filename: file.originalname,
      gridFsId,
      contentType,
    });

    return this.imageRepo.save(image);
  }

  /**
   * Devuelve un stream legible con la imagen solicitada.
   * Lanza 404 si el metadato no existe.
   */
  async stream(gridId: ObjectId) {
    const meta = await this.imageRepo.findOneBy({ gridFsId: gridId });
    if (!meta) {
      throw new NotFoundException('Imagen no encontrada');
    }

    this.logger.debug(`Streaming imagen ${gridId}`);
    return { stream: this.bucket.openDownloadStream(gridId), meta };
  }
}
