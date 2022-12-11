import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingTypeListComponent } from './training-type-list.component';

describe('TrainingTypeListComponent', () => {
  let component: TrainingTypeListComponent;
  let fixture: ComponentFixture<TrainingTypeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingTypeListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
