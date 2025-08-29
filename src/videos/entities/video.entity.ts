import { Entity, Column, ObjectIdColumn, CreateDateColumn, ObjectId } from 'typeorm';

@Entity('videos')
export class Video {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column('objectid')
  gridFsId: ObjectId;

  @Column()
  filename: string;

  @Column({ nullable: true })
  contentType: string;

  @Column({ type: 'int', comment: 'Duración en segundos', nullable: true })
  duration: number;

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ nullable: true })
  hash: string; // Nuevo campo para almacenar el hash único del video

  @CreateDateColumn()
  createdAt: Date;
}
