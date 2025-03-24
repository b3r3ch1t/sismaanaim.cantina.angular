import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryBalanceClientsComponent } from './summary-balance-clients.component';

describe('SummaryBalanceClientsComponent', () => {
  let component: SummaryBalanceClientsComponent;
  let fixture: ComponentFixture<SummaryBalanceClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryBalanceClientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryBalanceClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
