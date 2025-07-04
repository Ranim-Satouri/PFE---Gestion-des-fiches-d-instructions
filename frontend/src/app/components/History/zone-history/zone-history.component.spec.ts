import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneHistoryComponent } from './zone-history.component';

describe('ZoneHistoryComponent', () => {
  let component: ZoneHistoryComponent;
  let fixture: ComponentFixture<ZoneHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZoneHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
