import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndCashierComponent } from './end-cashier.component';

describe('EndCashierComponent', () => {
  let component: EndCashierComponent;
  let fixture: ComponentFixture<EndCashierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndCashierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndCashierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
