import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/entities/user.entity';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { system_module } from './systemModule.entity';


@Entity({ name: 'permission' })
export class Permission {
    @ApiProperty({
        description: 'Unique identifier of the permission',
        type: String,
    })
    @PrimaryGeneratedColumn('uuid')
    id_permission: string;

    @ApiProperty({
        description: 'Module name that is assigned in an interface',
        type: String,
    })
    @Column('text')
    module_name: string;

    @ApiProperty({
        description: 'Permission to create resources',
        type: Boolean,
    })
    @Column('bool', { default: false })
    create: boolean;

    @ApiProperty({
        description: 'Permission to read resources',
        type: Boolean,
    })
    @Column('bool', { default: false })
    read: boolean;

    @ApiProperty({
        description: 'Permission to update resources',
        type: Boolean,
    })
    @Column('bool', { default: false })
    update: boolean;

    @ApiProperty({
        description: 'Permission to delete resources',
        type: Boolean,
    })
    @Column('bool', { default: false })
    delete: boolean;

    @ManyToOne(() => User, (user) => user.permissions)
    user: User;

    @ManyToOne(() => system_module, (module) => module.permissions, { eager: true }) // Relación con el módulo
    module: system_module;
}
