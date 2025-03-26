import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailAtendentEventComponent } from './detail-atendent-event.component';

describe('DetailAtendentEventComponent', () => {
  let component: DetailAtendentEventComponent;
  let fixture: ComponentFixture<DetailAtendentEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailAtendentEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailAtendentEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
