import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserZoneAssignComponent } from './user-zone-assign.component';

describe('UserZoneAssignComponent', () => {
  let component: UserZoneAssignComponent;
  let fixture: ComponentFixture<UserZoneAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserZoneAssignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserZoneAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
