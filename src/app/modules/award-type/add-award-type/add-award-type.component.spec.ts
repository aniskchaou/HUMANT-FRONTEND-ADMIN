import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAwardTypeComponent } from './add-award-type.component';

describe('AddAwardTypeComponent', () => {
  let component: AddAwardTypeComponent;
  let fixture: ComponentFixture<AddAwardTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAwardTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAwardTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
