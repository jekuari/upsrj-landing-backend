import { BadRequestException } from '@nestjs/common';

export const videoFileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
) => {
    if (!file) {
        return callback(new BadRequestException('No se encontró archivo'), false);
    }

    const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new BadRequestException('Tipo de archivo no soportado. Solo se aceptan videos (mp4, webm, mov, mkv).'), false);
    }
};