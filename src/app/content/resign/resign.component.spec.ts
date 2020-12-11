import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResignComponent } from './resign.component';

describe('ResignComponent', () => {
  let component: ResignComponent;
  let fixture: ComponentFixture<ResignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
