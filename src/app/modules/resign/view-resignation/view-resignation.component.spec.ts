import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewResignationComponent } from './view-resignation.component';

describe('ViewResignationComponent', () => {
  let component: ViewResignationComponent;
  let fixture: ComponentFixture<ViewResignationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewResignationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewResignationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
