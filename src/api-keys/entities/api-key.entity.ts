import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('api_keys')
export class ApiKey {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  userId: ObjectId;

  @Column()
  hashedKey: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  expiresAt: Date;

  @Column('simple-array')
  permissions: string[];

  @CreateDateColumn()
  createdAt: Date;
}
