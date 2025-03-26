import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionaryDetailComponent } from './permissionary-detail.component';

describe('PermissionaryDetailComponent', () => {
  let component: PermissionaryDetailComponent;
  let fixture: ComponentFixture<PermissionaryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionaryDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionaryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
