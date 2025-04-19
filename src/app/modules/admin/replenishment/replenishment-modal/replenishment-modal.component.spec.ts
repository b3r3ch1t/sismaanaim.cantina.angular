import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplenishmentModalComponent } from './replenishment-modal.component';

describe('ReplenishmentModalComponent', () => {
  let component: ReplenishmentModalComponent;
  let fixture: ComponentFixture<ReplenishmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplenishmentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplenishmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
