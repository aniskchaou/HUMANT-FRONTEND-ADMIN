import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContractTypeComponent } from './add-contract-type.component';

describe('AddContractTypeComponent', () => {
  let component: AddContractTypeComponent;
  let fixture: ComponentFixture<AddContractTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddContractTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContractTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
