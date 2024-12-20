import { ApiProperty } from '@nestjs/swagger';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'system_module' })
export class system_module {

    @ApiProperty({
        description: 'Unique identifier of the user',
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
        description: 'Indicates whether the user is active',
        type: Boolean,
    })
    @Column('bool', { default: true })
    isActive: boolean;

    @BeforeInsert()
    @BeforeUpdate()
    normalizeFields() {
        this.module_name = this.module_name.toLowerCase().trim();
    }
}
