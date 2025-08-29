import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg'; //TODO: instalar ffmpeg en docker
import * as ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { Readable } from 'stream';
import * as crypto from 'crypto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    @Inject('GRIDFS_BUCKET_VIDEOS') private readonly bucket: GridFSBucket,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {
    //Indicar a fluent-ffmpeg la ruta de ambos binarios
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    ffmpeg.setFfprobePath(ffprobeInstaller.path);

    this.logger.log(`Ruta de FFmpeg establecida: ${ffmpegInstaller.path}`);
    this.logger.log(`Ruta de FFprobe establecida: ${ffprobeInstaller.path}`);
  }

  /**
   * Extrae metadatos del video (duración, dimensiones) usando ffprobe.
   */
  private async getVideoMetadata(
    buffer: Buffer,
  ): Promise<{ metadata: ffmpeg.FfprobeData; hash: string }> {
    const fs = await import('fs');
    const os = await import('os');
    const path = await import('path');
    const tmpDir = os.tmpdir();
    const tmpFilePath = path.join(tmpDir, `video-meta-${Date.now()}.tmp`);

    // Calcular el hash del archivo
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Verificar si el hash ya existe en la base de datos
    const existingVideo = await this.videoRepository.findOne({
      where: { hash },
    });
    if (existingVideo) {
      throw new BadRequestException('El video ya existe en el sistema.');
    }

    // Escribe el buffer a un archivo temporal
    await fs.promises.writeFile(tmpFilePath, buffer);

    const metadata = await new Promise<ffmpeg.FfprobeData>(
      (resolve, reject) => {
        ffmpeg.ffprobe(tmpFilePath, (err, metadata) => {
          fs.promises
            .unlink(tmpFilePath)
            .catch((e) =>
              this.logger.warn(
                `No se pudo eliminar el archivo temporal: ${tmpFilePath}`,
                e,
              ),
            );
          if (err) {
            this.logger.error(
              `ffprobe falló al procesar el archivo.`,
              err.stack,
            );
            return reject(
              new BadRequestException(
                'No se pudieron procesar los metadatos del video.',
              ),
            );
          }
          resolve(metadata);
        });
      },
    );

    return { metadata, hash };
  }

  /**
   * Sube un video, extrae sus metadatos y guarda la referencia.
   */
  async upload(
    file: Express.Multer.File,
  ): Promise<{ id: string; gridFsId: string }> {
    if (!file?.buffer) {
      throw new BadRequestException('File is empty.');
    }

    const readableStream = Readable.from(file.buffer);

    const uploadStream = this.bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
      chunkSizeBytes: 255 * 1024,
    });

    const gridFsId: ObjectId = await new Promise((resolve, reject) => {
      uploadStream.on('finish', () => {
        resolve(uploadStream.id);
      });

      uploadStream.on('error', (err) => {
        this.logger.error(`Error uploading video to GridFS: ${err.message}`);
        reject(err);
      });

      readableStream.pipe(uploadStream);
    });

    this.logger.verbose(`Video stored in GridFS with ID: ${gridFsId}`);

    const video = this.videoRepository.create({
      gridFsId,
      filename: file.originalname,
      contentType: file.mimetype,
      hash: uuid(),
    });

    const res = await this.videoRepository.save(video);
    return { id: res._id.toString(), gridFsId: gridFsId.toString() };
  }

  /**
   * Prepara un stream de video que soporta peticiones de rango.
   */
  async stream(id: ObjectId, rangeHeader: string | undefined) {
    // 1. Find the file metadata first
    const file = await this.bucket.find({ _id: id }).next();
    if (!file || !file.length) {
      throw new NotFoundException('Video not found.');
    }

    const totalSize = file.length;
    const contentType = file.contentType;

    // 2. If no range is requested, stream the entire file
    if (!rangeHeader) {
      const stream = this.bucket.openDownloadStream(file._id);
      return {
        headers: {
          'Content-Length': totalSize,
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes', // It's good practice to always include this
        },
        stream,
        statusCode: 200, // OK
      };
    }

    // 3. Robustly parse the 'Range' header
    const [startStr, endStr] = rangeHeader.replace(/bytes=/, '').split('-');

    let start = startStr ? parseInt(startStr, 10) : 0;
    let end = endStr ? parseInt(endStr, 10) : totalSize - 1;

    // Handle the "bytes=-<suffix>" case (e.g., "bytes=-500")
    if (!startStr && endStr) {
      start = totalSize - parseInt(endStr, 10);
      end = totalSize - 1;
    }

    // 4. Handle invalid ranges by throwing a 'Range Not Satisfiable' error
    if (start >= totalSize || end >= totalSize || start > end) {
      throw new HttpException(
        'Range Not Satisfiable',
        HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE,
      );
    }

    const chunkSize = end - start + 1;

    // 5. Create the stream with the correct range options for GridFS
    // The 'end' option for openDownloadStream is exclusive, so we add 1.
    const stream = this.bucket.openDownloadStream(file._id, {
      start,
      end: end + 1,
    });

    // Note: The problematic stream.on('error') handler has been removed.
    // The framework (NestJS/Express) will handle stream errors automatically.

    return {
      headers: {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      },
      stream,
      statusCode: 206, // Partial Content
    };
  }

  // Los métodos findAll y deleteImage son prácticamente idénticos,
  // solo cambian la entidad y los mensajes.

  async deleteVideo(gridId: ObjectId): Promise<{ message: string }> {
    const meta = await this.videoRepository.findOne({
      where: { gridFsId: gridId },
    });
    if (!meta) throw new NotFoundException('Video no encontrado');

    try {
      await this.bucket.delete(gridId);
      this.logger.verbose(`Archivo GridFS ${gridId} eliminado`);
    } catch (err: any) {
      this.logger.error(
        `Error al borrar GridFS ${gridId}: ${err.message}`,
        err.stack,
      );
      throw new InternalServerErrorException(
        'No se pudo eliminar el video del almacenamiento.',
      );
    }

    await this.videoRepository.delete({ gridFsId: gridId });
    this.logger.verbose(`Metadatos Video ${gridId} eliminados`);

    return { message: 'Video eliminado correctamente' };
  }

  async getPaginatedVideos(skip: number, limit: number) {
    const [data, total] = await this.videoRepository.findAndCount({
      skip,
      take: limit,
    });
    // Desestructurar y modificar los datos si es necesario
    const modifiedData = data.map((video) => ({
      gridFsId: video.gridFsId.toString(), // Convertir ObjectId a string
      filename: video.filename,
      contentType: video.contentType,
      duration: video.duration,
      width: video.width,
      height: video.height,
      hash: video.hash, // Incluir el hash en los datos retornados
    }));

    return [modifiedData, total];
  }
}
