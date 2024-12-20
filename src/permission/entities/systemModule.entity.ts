import { ApiProperty } from '@nestjs/swagger';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Permission } from 'src/permission/entities/permission.entity'; // Importa la entidad de permisos

@Entity({ name: 'system_module' })
export class system_module {
    @ApiProperty({
        description: 'Unique identifier of the module',
        type: String,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Name of the module',
        type: String,
    })
    @Column('text')
    module_name: string;

    @ApiProperty({
        description: 'Indicates whether the module is active',
        type: Boolean,
    })
    @Column('bool', { default: true })
    isActive: boolean;

    @OneToMany(() => Permission, (permission) => permission.module) // Relación inversa con los permisos
    permissions: Permission[];

    @BeforeInsert()
    @BeforeUpdate()
    normalizeFields() {
        this.module_name = this.module_name.toLowerCase().trim();
    }
}
