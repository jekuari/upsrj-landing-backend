import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity({ name: 'invite_tokens' })
export class InviteToken {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  token: string;

  @Column()
  userId: ObjectId;

  @Column()
  type: 'invite' | 'password_reset';

  @Column()
  expiresAt: Date;

  @Column()
  createdAt: Date;
}
