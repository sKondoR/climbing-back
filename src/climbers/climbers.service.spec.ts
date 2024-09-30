import { Test, TestingModule } from '@nestjs/testing';
import { ClimbersService } from './climbers.service';

describe('ClimbersService', () => {
  let service: ClimbersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClimbersService],
    }).compile();

    service = module.get<ClimbersService>(ClimbersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
