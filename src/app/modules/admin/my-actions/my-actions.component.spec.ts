import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyActionsComponent } from './my-actions.component';

describe('MyActionsComponent', () => {
  let component: MyActionsComponent;
  let fixture: ComponentFixture<MyActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
