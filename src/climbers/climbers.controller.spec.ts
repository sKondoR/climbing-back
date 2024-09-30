import { Test, TestingModule } from '@nestjs/testing';
import { ClimbersController } from './climbers.controller';
import { ClimbersService } from './climbers.service';

describe('ClimbersController', () => {
  let controller: ClimbersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClimbersController],
      providers: [ClimbersService],
    }).compile();

    controller = module.get<ClimbersController>(ClimbersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
