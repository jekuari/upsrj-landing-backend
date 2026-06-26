import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

export type LeadStatus = 'new' | 'acknowledged' | 'contacted';

export interface LeadStatusHistoryEntry {
  status: LeadStatus;
  updatedAt: Date;
  updatedBy?: string; // admin user email who made the change
}

@Entity('leads')
export class Lead {
  @ObjectIdColumn()
  _id: ObjectId;

  /** Full name of the lead */
  @Column()
  name: string;

  /** Email address of the lead */
  @Column()
  email: string;

  /** Phone number of the lead */
  @Column({ nullable: true })
  phone?: string;

  /** Current status of the lead */
  @Column({ default: 'new' })
  status: LeadStatus;

  /** Full status history log */
  @Column('simple-json', { default: '[]' })
  statusHistory: LeadStatusHistoryEntry[];

  /** Timestamp when the lead submitted the form */
  @CreateDateColumn()
  createdAt: Date;

  /** Timestamp of last update */
  @UpdateDateColumn()
  updatedAt: Date;
}
