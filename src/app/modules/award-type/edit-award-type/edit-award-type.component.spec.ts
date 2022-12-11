import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAwardTypeComponent } from './edit-award-type.component';

describe('EditAwardTypeComponent', () => {
  let component: EditAwardTypeComponent;
  let fixture: ComponentFixture<EditAwardTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditAwardTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAwardTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
