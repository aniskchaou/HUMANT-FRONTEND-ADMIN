import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNoticeComponent } from './add-notice.component';

describe('AddNoticeComponent', () => {
  let component: AddNoticeComponent;
  let fixture: ComponentFixture<AddNoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNoticeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
