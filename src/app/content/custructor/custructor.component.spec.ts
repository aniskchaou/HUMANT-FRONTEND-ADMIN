import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustructorComponent } from './custructor.component';

describe('CustructorComponent', () => {
  let component: CustructorComponent;
  let fixture: ComponentFixture<CustructorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustructorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustructorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
