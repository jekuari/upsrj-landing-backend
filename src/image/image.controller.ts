// src/images/images.controller.ts
import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Res,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { UploadImageResponseDto } from './dto/upload-image.response';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { ImagesService } from './image.service';
import { fileFilter } from './helpers/fileFilter.helper';

@ApiTags('Images')
@Controller('files/product')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @ApiOperation({ summary: 'Subir una imagen de producto' })
  @ApiCreatedResponse({ type: UploadImageResponseDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      fileFilter,
      limits: { fileSize: 5_000_000 }, // 5 MB
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadImageResponseDto> {
    if (!file) {
      throw new BadRequestException('Asegúrate de enviar una imagen');
    }

    const image = await this.imagesService.upload(file);

    return {
      id: image.gridFsId.toString(),
      url: `/files/product/${image.gridFsId}`,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Descargar/visualizar una imagen por ID' })
  @ApiParam({ name: 'id', description: 'ObjectId de la imagen' })
  @ApiOkResponse({ description: 'Devuelve la imagen solicitada (stream)' })
  async get(
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Res() res: Response,
  ) {
    const { stream, meta } = await this.imagesService.stream(id);
    res.setHeader('Content-Type', meta.contentType);
    return stream.pipe(res);
  }
}
