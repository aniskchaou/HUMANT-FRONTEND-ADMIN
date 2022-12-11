import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTransferComponent } from './edit-transfer.component';

describe('EditTransferComponent', () => {
  let component: EditTransferComponent;
  let fixture: ComponentFixture<EditTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditTransferComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
