import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwardTypeModalComponent } from './award-type-modal.component';

describe('AwardTypeModalComponent', () => {
  let component: AwardTypeModalComponent;
  let fixture: ComponentFixture<AwardTypeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AwardTypeModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardTypeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
