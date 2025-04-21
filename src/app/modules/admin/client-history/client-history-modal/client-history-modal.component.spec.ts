import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientHistoryModalComponent } from './client-history-modal.component';

describe('ClientHistoryModalComponent', () => {
  let component: ClientHistoryModalComponent;
  let fixture: ComponentFixture<ClientHistoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientHistoryModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientHistoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
