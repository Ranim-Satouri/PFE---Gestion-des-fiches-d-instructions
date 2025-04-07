import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheValidationComponent } from './fiche-validation.component';

describe('FicheValidationComponent', () => {
  let component: FicheValidationComponent;
  let fixture: ComponentFixture<FicheValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheValidationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
