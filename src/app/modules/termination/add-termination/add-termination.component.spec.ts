import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTerminationComponent } from './add-termination.component';

describe('AddTerminationComponent', () => {
  let component: AddTerminationComponent;
  let fixture: ComponentFixture<AddTerminationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTerminationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTerminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
