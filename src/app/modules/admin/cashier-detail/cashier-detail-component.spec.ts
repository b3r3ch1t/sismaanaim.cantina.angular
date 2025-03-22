import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierDetailComponent  } from './cashier-detail-component';

describe('CashierDetailComponentComponent', () => {
  let component: CashierDetailComponent ;
  let fixture: ComponentFixture<CashierDetailComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashierDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashierDetailComponent );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
