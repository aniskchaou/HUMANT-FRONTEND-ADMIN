import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTransertComponent } from './view-transert.component';

describe('ViewTransertComponent', () => {
  let component: ViewTransertComponent;
  let fixture: ComponentFixture<ViewTransertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewTransertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTransertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
