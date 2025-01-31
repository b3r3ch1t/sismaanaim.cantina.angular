import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplenishmentComponent } from './replenishment.component';

describe('ReplenishmentComponent', () => {
  let component: ReplenishmentComponent;
  let fixture: ComponentFixture<ReplenishmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplenishmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplenishmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
