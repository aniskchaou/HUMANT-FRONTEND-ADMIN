import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditContractTypeComponent } from './edit-contract-type.component';

describe('EditContractTypeComponent', () => {
  let component: EditContractTypeComponent;
  let fixture: ComponentFixture<EditContractTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditContractTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditContractTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
