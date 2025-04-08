import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsAllComponent } from './clients-all.component';

describe('ClientsAllComponent', () => {
  let component: ClientsAllComponent;
  let fixture: ComponentFixture<ClientsAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsAllComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
