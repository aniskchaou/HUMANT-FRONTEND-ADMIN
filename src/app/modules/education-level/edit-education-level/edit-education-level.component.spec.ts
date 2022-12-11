import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEducationLevelComponent } from './edit-education-level.component';

describe('EditEducationLevelComponent', () => {
  let component: EditEducationLevelComponent;
  let fixture: ComponentFixture<EditEducationLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditEducationLevelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEducationLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
