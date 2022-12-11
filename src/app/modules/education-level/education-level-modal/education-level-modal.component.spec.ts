import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationLevelModalComponent } from './education-level-modal.component';

describe('EducationLevelModalComponent', () => {
  let component: EducationLevelModalComponent;
  let fixture: ComponentFixture<EducationLevelModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EducationLevelModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationLevelModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
