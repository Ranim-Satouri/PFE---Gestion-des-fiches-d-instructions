import { TestBed } from '@angular/core/testing';

import { LigneService } from './ligne.service';

describe('LigneService', () => {
  let service: LigneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LigneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
