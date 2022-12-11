import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignationModalComponent } from './designation-modal.component';

describe('DesignationModalComponent', () => {
  let component: DesignationModalComponent;
  let fixture: ComponentFixture<DesignationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DesignationModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
