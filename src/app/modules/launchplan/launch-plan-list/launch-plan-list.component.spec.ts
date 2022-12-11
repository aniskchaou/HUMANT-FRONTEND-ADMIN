import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchPlanListComponent } from './launch-plan-list.component';

describe('LaunchPlanListComponent', () => {
  let component: LaunchPlanListComponent;
  let fixture: ComponentFixture<LaunchPlanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaunchPlanListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaunchPlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
