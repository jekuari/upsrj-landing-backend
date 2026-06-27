import { CreateUserDto } from 'src/auth/dto';
import { config } from 'dotenv';
config();

export const initialData: { moduleName: string; isActive: boolean }[] = [];

export const initialUsers: CreateUserDto[] = [
  {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    fullName: process.env.ADMIN_NAME,
    matricula: process.env.ADMIN_MATRICULA,
  },
];
