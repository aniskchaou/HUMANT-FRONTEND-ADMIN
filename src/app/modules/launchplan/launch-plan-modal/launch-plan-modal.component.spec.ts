import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchPlanModalComponent } from './launch-plan-modal.component';

describe('LaunchPlanModalComponent', () => {
  let component: LaunchPlanModalComponent;
  let fixture: ComponentFixture<LaunchPlanModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaunchPlanModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaunchPlanModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
