import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTrainingTypeComponent } from './add-training-type.component';

describe('AddTrainingTypeComponent', () => {
  let component: AddTrainingTypeComponent;
  let fixture: ComponentFixture<AddTrainingTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTrainingTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTrainingTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
