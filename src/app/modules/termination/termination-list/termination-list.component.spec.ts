import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminationListComponent } from './termination-list.component';

describe('TerminationListComponent', () => {
  let component: TerminationListComponent;
  let fixture: ComponentFixture<TerminationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TerminationListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
