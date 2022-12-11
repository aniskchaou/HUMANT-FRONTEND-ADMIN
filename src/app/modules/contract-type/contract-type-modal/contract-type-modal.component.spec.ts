import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractTypeModalComponent } from './contract-type-modal.component';

describe('ContractTypeModalComponent', () => {
  let component: ContractTypeModalComponent;
  let fixture: ComponentFixture<ContractTypeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractTypeModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractTypeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
