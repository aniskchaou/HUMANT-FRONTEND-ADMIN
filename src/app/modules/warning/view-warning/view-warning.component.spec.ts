import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWarningComponent } from './view-warning.component';

describe('ViewWarningComponent', () => {
  let component: ViewWarningComponent;
  let fixture: ComponentFixture<ViewWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewWarningComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
