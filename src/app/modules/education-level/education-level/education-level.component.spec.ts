import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationLevelComponent } from './education-level.component';

describe('EducationLevelComponent', () => {
  let component: EducationLevelComponent;
  let fixture: ComponentFixture<EducationLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EducationLevelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
