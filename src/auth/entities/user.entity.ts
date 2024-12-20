import { ApiProperty } from '@nestjs/swagger';
import { Permission } from 'src/permission/entities/permission.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
    @ApiProperty({
        description: 'Unique identifier of the user',
        type: String,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Matricula of the user for the UPSRJ',
        type: String,
    })
    @Column('text')
    matricula: string;

    @ApiProperty({
        description: 'Full name of the user',
        type: String,
    })
    @Column('text')
    fullName: string;

    @ApiProperty({
        description: 'Email address of the user',
        type: String,
    })
    @Column('text', { unique: true })
    email: string;

    @ApiProperty({
        description: 'Password of the user',
        type: String,
    })
    @Column('text', { select: false })
    password: string;

    @ApiProperty({
        description: 'Indicates whether the user is active',
        type: Boolean,
    })
    @Column('bool', { default: true })
    isActive: boolean;

    @OneToMany(
        () => Permission,
        (permission) => permission.user,
        { cascade: true , eager: true }
    )
    permissions: Permission[];

    @BeforeInsert()
    @BeforeUpdate()
    normalizeFields() {
        this.email = this.email.toLowerCase().trim();
        this.fullName = this.fullName.toLowerCase().trim();
    }
}
