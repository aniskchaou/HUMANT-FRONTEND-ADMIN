import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayslipModalComponent } from './payslip-modal.component';

describe('PayslipModalComponent', () => {
  let component: PayslipModalComponent;
  let fixture: ComponentFixture<PayslipModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayslipModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PayslipModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
