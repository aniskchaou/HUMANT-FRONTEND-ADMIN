import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewComplaintComponent } from './view-complaint.component';

describe('ViewComplaintComponent', () => {
  let component: ViewComplaintComponent;
  let fixture: ComponentFixture<ViewComplaintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewComplaintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewComplaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
