import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString } from 'class-validator';

export class UploadVideoResponseDto {
  @ApiProperty({
    example: '66b3b5a1a123b4c5d678e9f0',
    description: 'El ObjectId del archivo de video almacenado en GridFS.',
    type: String,
  })
  @IsString()
  @IsMongoId() // Asegura que es un string con formato de ObjectId
  _id: string;
}