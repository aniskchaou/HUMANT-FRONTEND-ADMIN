import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfertListComponent } from './transfert-list.component';

describe('TransfertListComponent', () => {
  let component: TransfertListComponent;
  let fixture: ComponentFixture<TransfertListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransfertListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransfertListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
