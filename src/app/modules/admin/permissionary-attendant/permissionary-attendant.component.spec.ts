import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionaryAttendantComponent } from './permissionary-attendant.component';

describe('PermissionaryAttendantComponent', () => {
  let component: PermissionaryAttendantComponent;
  let fixture: ComponentFixture<PermissionaryAttendantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionaryAttendantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionaryAttendantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
