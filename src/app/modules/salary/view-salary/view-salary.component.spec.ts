import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSalaryComponent } from './view-salary.component';

describe('ViewSalaryComponent', () => {
  let component: ViewSalaryComponent;
  let fixture: ComponentFixture<ViewSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewSalaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
