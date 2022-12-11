import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceSalaryModalComponent } from './advance-salary-modal.component';

describe('AdvanceSalaryModalComponent', () => {
  let component: AdvanceSalaryModalComponent;
  let fixture: ComponentFixture<AdvanceSalaryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvanceSalaryModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvanceSalaryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
