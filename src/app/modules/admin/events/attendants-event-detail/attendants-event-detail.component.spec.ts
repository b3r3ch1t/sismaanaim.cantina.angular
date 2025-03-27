import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendantsEventDetailComponent } from './attendants-event-detail.component';

describe('AttendantsEventDetailComponent', () => {
  let component: AttendantsEventDetailComponent;
  let fixture: ComponentFixture<AttendantsEventDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendantsEventDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendantsEventDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
