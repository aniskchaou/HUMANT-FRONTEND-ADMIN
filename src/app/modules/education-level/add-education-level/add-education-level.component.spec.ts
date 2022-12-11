import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEducationLevelComponent } from './add-education-level.component';

describe('AddEducationLevelComponent', () => {
  let component: AddEducationLevelComponent;
  let fixture: ComponentFixture<AddEducationLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEducationLevelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEducationLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
