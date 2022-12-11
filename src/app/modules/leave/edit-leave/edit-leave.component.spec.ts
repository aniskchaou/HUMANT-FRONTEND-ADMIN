import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLeaveComponent } from './edit-leave.component';

describe('EditLeaveComponent', () => {
  let component: EditLeaveComponent;
  let fixture: ComponentFixture<EditLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditLeaveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
