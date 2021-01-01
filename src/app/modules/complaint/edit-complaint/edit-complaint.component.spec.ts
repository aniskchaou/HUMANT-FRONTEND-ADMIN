import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditComplaintComponent } from './edit-complaint.component';

describe('EditComplaintComponent', () => {
  let component: EditComplaintComponent;
  let fixture: ComponentFixture<EditComplaintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditComplaintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditComplaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
