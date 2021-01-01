import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHolidayComponent } from './view-holiday.component';

describe('ViewHolidayComponent', () => {
  let component: ViewHolidayComponent;
  let fixture: ComponentFixture<ViewHolidayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewHolidayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
