import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplainListComponent } from './complain-list.component';

describe('ComplainListComponent', () => {
  let component: ComplainListComponent;
  let fixture: ComponentFixture<ComplainListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplainListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplainListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
