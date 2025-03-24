import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryOperationsGraphicComponent } from './summary-operations-graphic.component';

describe('SummaryOperationsGraphicComponent', () => {
  let component: SummaryOperationsGraphicComponent;
  let fixture: ComponentFixture<SummaryOperationsGraphicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryOperationsGraphicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryOperationsGraphicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
