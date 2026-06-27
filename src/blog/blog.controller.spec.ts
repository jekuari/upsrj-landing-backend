import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { UserPermissionGuard } from '../auth/guards/user-permission.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../auth/entities/role.entity';
import { BlogComponent } from './entities/blog.entity';

describe('BlogController', () => {
  let controller: BlogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [
        BlogService,
        {
          provide: getRepositoryToken(Role),
          useValue: {},
        },
        {
          provide: getRepositoryToken(BlogComponent),
          useValue: {},
        },
      ],
    })
      .overrideGuard(UserPermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BlogController>(BlogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
