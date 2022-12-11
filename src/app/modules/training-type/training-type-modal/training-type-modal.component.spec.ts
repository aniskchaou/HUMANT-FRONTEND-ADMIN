import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingTypeModalComponent } from './training-type-modal.component';

describe('TrainingTypeModalComponent', () => {
  let component: TrainingTypeModalComponent;
  let fixture: ComponentFixture<TrainingTypeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingTypeModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingTypeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
