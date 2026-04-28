import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { HTTPService } from 'src/app/main/services/HTTPService';

import { JobComponent } from './job.component';

describe('JobComponent', () => {
  let component: JobComponent;
  let fixture: ComponentFixture<JobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JobComponent],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        {
          provide: HTTPService,
          useValue: {
            getAll: () =>
              of([
                {
                  id: 1,
                  name: 'Senior Payroll Analyst',
                  description:
                    'Own payroll operations, resolve discrepancies, and coordinate month-end reporting across finance and HR.',
                },
              ]),
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
    fixture = TestBed.createComponent(JobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select a job for details when opened', () => {
    const job = component.filteredJobs[0];

    component.openDetailsModal(job);

    expect(component.featuredJob).toEqual(job);
  });
});
