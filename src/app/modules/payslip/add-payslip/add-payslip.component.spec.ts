import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPayslipComponent } from './add-payslip.component';

describe('AddPayslipComponent', () => {
  let component: AddPayslipComponent;
  let fixture: ComponentFixture<AddPayslipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPayslipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPayslipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
