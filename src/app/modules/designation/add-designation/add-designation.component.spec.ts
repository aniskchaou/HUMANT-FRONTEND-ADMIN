import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDesignationComponent } from './add-designation.component';

describe('AddDesignationComponent', () => {
  let component: AddDesignationComponent;
  let fixture: ComponentFixture<AddDesignationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDesignationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDesignationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
