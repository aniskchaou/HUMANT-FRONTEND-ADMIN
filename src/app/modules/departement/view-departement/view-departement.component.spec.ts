import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDepartementComponent } from './view-departement.component';

describe('ViewDepartementComponent', () => {
  let component: ViewDepartementComponent;
  let fixture: ComponentFixture<ViewDepartementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDepartementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDepartementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
