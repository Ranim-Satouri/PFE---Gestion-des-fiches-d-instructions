import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilleHistoryComponent } from './famille-history.component';

describe('FamilleHistoryComponent', () => {
  let component: FamilleHistoryComponent;
  let fixture: ComponentFixture<FamilleHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilleHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FamilleHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
