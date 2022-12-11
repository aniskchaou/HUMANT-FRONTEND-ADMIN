import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditComplainComponent } from './edit-complain.component';

describe('EditComplainComponent', () => {
  let component: EditComplainComponent;
  let fixture: ComponentFixture<EditComplainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditComplainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditComplainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
