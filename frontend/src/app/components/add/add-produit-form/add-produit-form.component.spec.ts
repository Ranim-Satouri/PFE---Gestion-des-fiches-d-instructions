import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProduitFormComponent } from './add-produit-form.component';

describe('AddProduitFormComponent', () => {
  let component: AddProduitFormComponent;
  let fixture: ComponentFixture<AddProduitFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProduitFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProduitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
