import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesModuleController } from './templates-module.controller';
import { TemplatesModuleService } from './templates-module.service';

describe('TemplatesModuleController', () => {
  let controller: TemplatesModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatesModuleController],
      providers: [TemplatesModuleService],
    }).compile();

    controller = module.get<TemplatesModuleController>(TemplatesModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
