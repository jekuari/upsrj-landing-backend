import { ApiProperty } from '@nestjs/swagger';
import { Permission } from 'src/permission/entities/permission.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({name:"users"})
export class User {

    @ApiProperty({
        description: 'Identificador único del usuario',
        type: String,
    })
    @PrimaryGeneratedColumn('uuid')
    id:string;

    //* Mail de los usuarios
    @ApiProperty({
        description: 'Correo del usuario',
        type: String,
    })
    @Column('text', {
        unique:true
    })
    email:string;

    //* Password
    @ApiProperty({
        description: 'Contraseña de los usuarios',
        type: String,
    })
    @Column('text', {
        select:false
    })
    password:string;

    //* FullName
     @ApiProperty({
        description: 'Nombre completo de los usuarios',
        type: String,
    })
    @Column('text')
    fullName:string;

    @ApiProperty({
        description: 'Matricula of the user for the UPSRJ',
        type: String,
    })
    @Column('text')
    matricula: string;

    //* IsActive
    @ApiProperty({
        description: 'Los usuarios no se elimina, solo se dan de baja con un boolean',
        type: Boolean,
    })
    @Column('bool' , {
        default:true
    })
    isActive:boolean;

    // isDeleted)
    @ApiProperty({description: 'Eliminar usuario logicamente (soft delete)', 
        type: Boolean
    })
    @Column('bool',{
        default: false 
    })
    isDeleted: boolean;

    @OneToMany(
        () => Permission,
        (permission) => permission.user,
        { cascade: true , eager: true }
    )
    permissions: Permission[];
    
    @BeforeInsert()
    checkFieldsInsert() {

        this.email = this.email
            .toLowerCase()
            .trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {

        this.email = this.email
            .toLowerCase()
            .trim();
    }

}   

