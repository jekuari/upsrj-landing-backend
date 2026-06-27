import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesModuleController } from './templates-module.controller';
import { TemplatesModuleService } from './templates-module.service';
import { UserPermissionGuard } from '../auth/guards/user-permission.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../auth/entities/role.entity';
import { TemplatesComponent } from './entities/templates-module.entity';

describe('TemplatesModuleController', () => {
  let controller: TemplatesModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatesModuleController],
      providers: [
        TemplatesModuleService,
        {
          provide: getRepositoryToken(Role),
          useValue: {},
        },
        {
          provide: getRepositoryToken(TemplatesComponent),
          useValue: {},
        },
      ],
    })
      .overrideGuard(UserPermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TemplatesModuleController>(TemplatesModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
