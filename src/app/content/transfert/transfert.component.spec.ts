import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfertComponent } from './transfert.component';

describe('TransfertComponent', () => {
  let component: TransfertComponent;
  let fixture: ComponentFixture<TransfertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransfertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransfertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
