import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTrainingTypeComponent } from './edit-training-type.component';

describe('EditTrainingTypeComponent', () => {
  let component: EditTrainingTypeComponent;
  let fixture: ComponentFixture<EditTrainingTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditTrainingTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTrainingTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
