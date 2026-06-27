import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Permission, ALL_PERMISSIONS } from '../enums/permission.enum';

@Entity({ name: 'roles' })
export class Role {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ unique: true })
  name: string; // e.g., "role:admin" or "manager"

  @Column('array', { default: [] })
  permissions: string[]; // Array of strings from Permission enum
}
