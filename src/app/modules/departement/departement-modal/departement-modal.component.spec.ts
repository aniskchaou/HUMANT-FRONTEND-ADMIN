import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartementModalComponent } from './departement-modal.component';

describe('DepartementModalComponent', () => {
  let component: DepartementModalComponent;
  let fixture: ComponentFixture<DepartementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepartementModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
