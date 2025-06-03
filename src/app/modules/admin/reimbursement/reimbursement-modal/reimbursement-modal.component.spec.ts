import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReimbursementModalComponent } from './reimbursement-modal.component';

describe('ReimbursementModalComponent', () => {
  let component: ReimbursementModalComponent;
  let fixture: ComponentFixture<ReimbursementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReimbursementModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReimbursementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
