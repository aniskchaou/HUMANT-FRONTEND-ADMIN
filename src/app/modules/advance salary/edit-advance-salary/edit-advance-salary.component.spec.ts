import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAdvanceSalaryComponent } from './edit-advance-salary.component';

describe('EditAdvanceSalaryComponent', () => {
  let component: EditAdvanceSalaryComponent;
  let fixture: ComponentFixture<EditAdvanceSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditAdvanceSalaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAdvanceSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
