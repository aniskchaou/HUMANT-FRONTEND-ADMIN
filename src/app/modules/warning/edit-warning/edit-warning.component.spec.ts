import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWarningComponent } from './edit-warning.component';

describe('EditWarningComponent', () => {
  let component: EditWarningComponent;
  let fixture: ComponentFixture<EditWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditWarningComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
