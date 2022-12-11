import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLaunchPlanComponent } from './edit-launch-plan.component';

describe('EditLaunchPlanComponent', () => {
  let component: EditLaunchPlanComponent;
  let fixture: ComponentFixture<EditLaunchPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditLaunchPlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLaunchPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
