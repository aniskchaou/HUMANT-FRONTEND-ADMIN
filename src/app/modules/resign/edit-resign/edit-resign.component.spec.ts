import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditResignComponent } from './edit-resign.component';

describe('EditResignComponent', () => {
  let component: EditResignComponent;
  let fixture: ComponentFixture<EditResignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditResignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditResignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
