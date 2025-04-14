import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LigneListComponent } from './ligne-list.component';

describe('LigneListComponent', () => {
  let component: LigneListComponent;
  let fixture: ComponentFixture<LigneListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LigneListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LigneListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
