import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddResignationComponent } from './add-resignation.component';

describe('AddResignationComponent', () => {
  let component: AddResignationComponent;
  let fixture: ComponentFixture<AddResignationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddResignationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddResignationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
