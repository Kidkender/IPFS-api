import { Test, TestingModule } from '@nestjs/testing';
import { EvidencesController } from './evidences.controller';

describe('EvidencesController', () => {
  let controller: EvidencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvidencesController],
    }).compile();

    controller = module.get<EvidencesController>(EvidencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
