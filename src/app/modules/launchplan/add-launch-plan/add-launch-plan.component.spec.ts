import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLaunchPlanComponent } from './add-launch-plan.component';

describe('AddLaunchPlanComponent', () => {
  let component: AddLaunchPlanComponent;
  let fixture: ComponentFixture<AddLaunchPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddLaunchPlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLaunchPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
