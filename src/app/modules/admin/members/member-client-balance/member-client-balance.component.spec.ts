import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberClientBalanceComponent } from './member-client-balance.component';

describe('MemberClientBalanceComponent', () => {
  let component: MemberClientBalanceComponent;
  let fixture: ComponentFixture<MemberClientBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberClientBalanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberClientBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
