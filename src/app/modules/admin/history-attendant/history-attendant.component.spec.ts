import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryAttendantComponent } from './history-attendant.component';

describe('HistoryAttendantComponent', () => {
  let component: HistoryAttendantComponent;
  let fixture: ComponentFixture<HistoryAttendantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryAttendantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryAttendantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
