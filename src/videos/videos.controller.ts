import {
  Controller,
  Post,
  Get,
  Delete,
  UploadedFile,
  UseInterceptors,
  Res,
  Param,
  BadRequestException,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiParam,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { videoFileFilter } from './helpers/videoFileFilter.helper';
import { UploadVideoResponseDto } from './dto/upload-video.response';
import { Auth } from 'src/auth/decorators';

@ApiTags('Videos')
@Controller('videos')
@ApiBearerAuth('JWT-auth')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Auth([{ module: 'Videos', permission: 'canCreate' }])
  @Post('upload')
  @ApiOperation({ summary: 'Subir un video' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ type: UploadVideoResponseDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: null, // Dejamos que el servicio maneje el buffer
      fileFilter: videoFileFilter, // Un filtro para videos
      limits: { fileSize: 500_000_000 }, // 500 MB
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadVideoResponseDto> {
    if (!file) throw new BadRequestException('Asegúrate de enviar un video.');

    const video = await this.videosService.upload(file);
    return {
      _id: video.gridFsId.toString(),
    };
  }

  @Get('stream/:id')
  @ApiOperation({ summary: 'Reproducir/descargar un video por ID' })
  @ApiParam({ name: 'id', description: 'ObjectId del video en GridFS' })
  @ApiOkResponse({
    description: 'Devuelve el stream del video (parcial o completo).',
  })
  async streamVideo(
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Headers('range') range: string, // <-- Capturamos el encabezado 'Range'
    @Res() res: Response,
  ) {
    const { headers, stream, statusCode } = await this.videosService.stream(
      id,
      range,
    );

    // Establecemos el código de estado (200 o 206) y los encabezados
    res.status(statusCode);
    res.set(headers);

    // Enviamos el stream al cliente
    stream.pipe(res);
  }

  @Auth([{ module: 'Videos', permission: 'canDelete' }])
  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Eliminar un video por ID' })
  @ApiNoContentResponse({ description: 'Video eliminado correctamente' })
  async deleteVideo(
    @Param('id', ParseObjectIdPipe) id: ObjectId,
  ): Promise<{ message: string }> {
    return this.videosService.deleteVideo(id);
  }
}

