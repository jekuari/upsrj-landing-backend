import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BlogComponent } from './entities/blog.entity';

describe('BlogService', () => {
  let service: BlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: getRepositoryToken(BlogComponent),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
