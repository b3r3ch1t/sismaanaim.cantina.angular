import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierEventDetailComponentComponent } from './cashier-event-detail-component';

describe('CashierEventDetailComponentComponent', () => {
  let component: CashierEventDetailComponentComponent;
  let fixture: ComponentFixture<CashierEventDetailComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashierEventDetailComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashierEventDetailComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
