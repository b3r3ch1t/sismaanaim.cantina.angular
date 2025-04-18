import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReimbursementComponent } from './reimbursement.component';

describe('ReimbursementComponent', () => {
  let component: ReimbursementComponent;
  let fixture: ComponentFixture<ReimbursementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReimbursementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReimbursementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
