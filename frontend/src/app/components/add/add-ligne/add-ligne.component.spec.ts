import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLigneComponent } from './add-ligne.component';

describe('AddLigneComponent', () => {
  let component: AddLigneComponent;
  let fixture: ComponentFixture<AddLigneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLigneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLigneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
