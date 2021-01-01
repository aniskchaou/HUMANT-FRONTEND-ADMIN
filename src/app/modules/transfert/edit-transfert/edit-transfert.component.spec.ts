import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTransfertComponent } from './edit-transfert.component';

describe('EditTransfertComponent', () => {
  let component: EditTransfertComponent;
  let fixture: ComponentFixture<EditTransfertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditTransfertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTransfertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
