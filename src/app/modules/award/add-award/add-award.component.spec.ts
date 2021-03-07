import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAwardComponent } from './add-award.component';

describe('AddAwardComponent', () => {
  let component: AddAwardComponent;
  let fixture: ComponentFixture<AddAwardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAwardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
