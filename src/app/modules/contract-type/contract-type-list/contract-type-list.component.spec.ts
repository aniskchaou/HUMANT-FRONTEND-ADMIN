import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractTypeListComponent } from './contract-type-list.component';

describe('ContractTypeListComponent', () => {
  let component: ContractTypeListComponent;
  let fixture: ComponentFixture<ContractTypeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractTypeListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
