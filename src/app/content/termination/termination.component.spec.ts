import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminationComponent } from './termination.component';

describe('TerminationComponent', () => {
  let component: TerminationComponent;
  let fixture: ComponentFixture<TerminationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TerminationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
