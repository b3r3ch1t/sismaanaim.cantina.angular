import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryBalanceCashiersComponent } from './summary-balance-cashiers.component';

describe('SummaryBalanceCashiersComponent', () => {
  let component: SummaryBalanceCashiersComponent;
  let fixture: ComponentFixture<SummaryBalanceCashiersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryBalanceCashiersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryBalanceCashiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
