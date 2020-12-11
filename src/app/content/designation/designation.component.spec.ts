import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignationComponent } from './designation.component';

describe('DesignationComponent', () => {
  let component: DesignationComponent;
  let fixture: ComponentFixture<DesignationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DesignationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
