import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTerminationComponent } from './edit-termination.component';

describe('EditTerminationComponent', () => {
  let component: EditTerminationComponent;
  let fixture: ComponentFixture<EditTerminationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditTerminationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTerminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
