import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAdvanceSalaryComponent } from './view-advance-salary.component';

describe('ViewAdvanceSalaryComponent', () => {
  let component: ViewAdvanceSalaryComponent;
  let fixture: ComponentFixture<ViewAdvanceSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAdvanceSalaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAdvanceSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
