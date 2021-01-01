import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTerminationComponent } from './view-termination.component';

describe('ViewTerminationComponent', () => {
  let component: ViewTerminationComponent;
  let fixture: ComponentFixture<ViewTerminationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewTerminationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTerminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
