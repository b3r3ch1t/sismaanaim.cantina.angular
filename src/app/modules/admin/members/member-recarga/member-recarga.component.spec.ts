import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EfichasRecargaComponent } from './member-recarga.component';

describe('EfichasRecargaComponent', () => {
  let component: EfichasRecargaComponent;
  let fixture: ComponentFixture<EfichasRecargaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EfichasRecargaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EfichasRecargaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
