import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { HTTPService } from 'src/app/main/services/HTTPService';

import { EmployeeComponent } from './employee.component';

describe('EmployeeComponent', () => {
  let component: EmployeeComponent;
  let fixture: ComponentFixture<EmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeComponent],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        {
          provide: HTTPService,
          useValue: {
            getAll: (url: string) => {
              if (url.indexOf('/employee/all') !== -1) {
                return of([
                  {
                    id: 1,
                    fullName: 'Sarah Connor',
                    phone: '555-7777',
                    birthDay: '1990-04-20',
                    gender: 'Female',
                    presentAddress: '123 Main Street',
                    permanentAddress: '123 Main Street',
                    joiningDate: '2025-07-01',
                    emergencyContactNumber: '555-9999',
                    note: 'Leads core people operations delivery.',
                    department: { id: 1, name: 'HR' },
                    job: { id: 1, name: 'HR Operations Manager' },
                    salary: { id: 1, salaryName: 'Base', totalSalary: '3500' },
                    contractType: { id: 1, name: 'Full Time' },
                  },
                ]);
              }

              if (url.indexOf('/departement/all') !== -1) {
                return of([{ id: 1, name: 'HR' }]);
              }

              if (url.indexOf('/job/all') !== -1) {
                return of([{ id: 1, name: 'HR Operations Manager' }]);
              }

              if (url.indexOf('/salary/all') !== -1) {
                return of([{ id: 1, salaryName: 'Base', totalSalary: '3500' }]);
              }

              if (url.indexOf('/contracttype/all') !== -1) {
                return of([{ id: 1, name: 'Full Time' }]);
              }

              return of([]);
            },
            create: () => Promise.resolve(),
            update: () => Promise.resolve(),
            remove: () => Promise.resolve(),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select an employee for details when opened', () => {
    const employee = component.filteredEmployees[0];

    component.openDetailsModal(employee);

    expect(component.featuredEmployee).toEqual(employee);
  });
});
