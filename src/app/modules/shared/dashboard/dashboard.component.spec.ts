import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { HTTPService } from 'src/app/main/services/HTTPService';

import { DashboardComponent } from './dashboard.component';

function createDashboardSummary() {
  return {
    employeeCount: 12,
    jobCount: 4,
    salaryCount: 3,
    trainingCount: 2,
    announcementCount: 5,
    activeAnnouncementCount: 3,
    liveTrainingCount: 1,
    terminationCount: 1,
    trackedRecords: 27,
    activeModules: 6,
    attentionCount: 4,
    fullyCompletedProfiles: 8,
    payrollTotal: 82000,
    averagePackage: 27333.33,
    profileCompletion: 67,
    featuredJobNames: ['HR Manager', 'Payroll Analyst'],
    payrollDistribution: [{ name: 'Executive', value: 42000 }],
    workforceDistribution: [{ name: 'Female', value: 7 }],
    priorityItems: [
      {
        title: 'Annual review announcement',
        description: 'Announcement window: Apr 20 to Apr 30.',
        meta: 'Announcement live',
        route: '/announcement',
      },
    ],
    timeline: [
      {
        stamp: 'Apr 20',
        title: 'Annual review announcement',
        description: 'Announcement window opens on Apr 20.',
        tone: 'navy',
      },
    ],
  };
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: HTTPService,
          useValue: {
            getAll: () => of(createDashboardSummary()),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
