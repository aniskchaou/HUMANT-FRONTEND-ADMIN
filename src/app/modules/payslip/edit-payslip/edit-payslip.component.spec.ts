import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPayslipComponent } from './edit-payslip.component';

describe('EditPayslipComponent', () => {
  let component: EditPayslipComponent;
  let fixture: ComponentFixture<EditPayslipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditPayslipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPayslipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
