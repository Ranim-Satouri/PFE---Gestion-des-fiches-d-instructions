import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheHistoryComponent } from './fiche-history.component';

describe('FicheHistoryComponent', () => {
  let component: FicheHistoryComponent;
  let fixture: ComponentFixture<FicheHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
