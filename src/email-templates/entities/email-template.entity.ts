import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('email_templates')
export class EmailTemplate {
  @ObjectIdColumn()
  _id: ObjectId;

  /** Human-readable name for the template */
  @Column()
  name: string;

  /** Email subject */
  @Column()
  subject: string;

  /** Email body (HTML or plain text) */
  @Column()
  body: string;

  @CreateDateColumn()
  createdAt: Date;
}
