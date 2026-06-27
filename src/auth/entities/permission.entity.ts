import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity({ name: 'permissions' })
export class Permission {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ unique: true })
  name: string;
}
