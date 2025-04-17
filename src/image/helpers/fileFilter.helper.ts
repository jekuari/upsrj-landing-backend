// src/images/helpers/file-filter.ts
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

const VALID_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

/**
 * Filtro Multer que restringe la subida a extensiones de imagen válidas.
 */
export const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file) {
    return cb(new BadRequestException('Archivo vacío'), false);
  }

  const ext = file.mimetype.split('/')[1];
  const accepted = VALID_EXTENSIONS.includes(ext.toLowerCase());

  return cb(null, accepted);
};
