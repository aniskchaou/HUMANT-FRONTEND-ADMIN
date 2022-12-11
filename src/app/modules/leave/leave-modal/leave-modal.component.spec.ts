import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveModalComponent } from './leave-modal.component';

describe('LeaveModalComponent', () => {
  let component: LeaveModalComponent;
  let fixture: ComponentFixture<LeaveModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
