// src/common/pipes/parse-object-id.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

/**
 * Convierte el parámetro `:id` (string) en un `ObjectId`.
 * Lanza 400 si el formato no es válido.
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, ObjectId> {
  transform(value: string): ObjectId {
    try {
      return new ObjectId(value);
    } catch {
      throw new BadRequestException('Formato de ObjectId inválido');
    }
  }
}
