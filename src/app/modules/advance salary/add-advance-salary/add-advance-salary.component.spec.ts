import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAdvanceSalaryComponent } from './add-advance-salary.component';

describe('AddAdvanceSalaryComponent', () => {
  let component: AddAdvanceSalaryComponent;
  let fixture: ComponentFixture<AddAdvanceSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAdvanceSalaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAdvanceSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
