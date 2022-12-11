import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveListComponent } from './leave-list.component';

describe('LeaveListComponent', () => {
  let component: LeaveListComponent;
  let fixture: ComponentFixture<LeaveListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
