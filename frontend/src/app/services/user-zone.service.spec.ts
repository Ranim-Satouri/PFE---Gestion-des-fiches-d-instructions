import { TestBed } from '@angular/core/testing';

import { UserZoneService } from './user-zone.service';

describe('UserZoneService', () => {
  let service: UserZoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserZoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
