import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryPemissionariesComponent } from './summary-pemissionaries.component';

describe('SummaryPemissionariesComponent', () => {
  let component: SummaryPemissionariesComponent;
  let fixture: ComponentFixture<SummaryPemissionariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryPemissionariesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryPemissionariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
