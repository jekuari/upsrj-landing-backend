// src/images/dto/paginated-images.response.ts
import { ApiProperty } from '@nestjs/swagger';

export class ImageMetaDto {
  @ApiProperty() id: string;
  @ApiProperty() filename: string;
  @ApiProperty() contentType: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() url: string;
}

export class PaginatedImagesDto {
  @ApiProperty({ example: 42 }) total:   number;
  @ApiProperty({ example: 10 }) limit:   number;
  @ApiProperty({ example: 0 })  offset:  number;
  @ApiProperty({ type: [ImageMetaDto] })
  data: ImageMetaDto[];
}
