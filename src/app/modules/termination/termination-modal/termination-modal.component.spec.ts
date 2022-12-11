import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminationModalComponent } from './termination-modal.component';

describe('TerminationModalComponent', () => {
  let component: TerminationModalComponent;
  let fixture: ComponentFixture<TerminationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TerminationModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
