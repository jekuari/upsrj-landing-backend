import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

export interface NavbarItem {
  id: string;
  label: string;
  url?: string;
  isOpenNewTab?: boolean;
  children?: NavbarItem[];
}

@Entity('navbar_configs')
export class NavbarConfig {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column('simple-json')
  mainLinks: NavbarItem[];

  @Column('simple-json')
  soyCoyoteLinks: NavbarItem[];
}
