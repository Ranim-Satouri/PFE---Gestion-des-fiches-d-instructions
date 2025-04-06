import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFamilleFormComponent } from './add-famille-form.component';

describe('AddFamilleFormComponent', () => {
  let component: AddFamilleFormComponent;
  let fixture: ComponentFixture<AddFamilleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFamilleFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFamilleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
