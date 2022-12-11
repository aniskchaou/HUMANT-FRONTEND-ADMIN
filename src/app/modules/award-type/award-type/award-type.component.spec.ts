import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwardTypeComponent } from './award-type.component';

describe('AwardTypeComponent', () => {
  let component: AwardTypeComponent;
  let fixture: ComponentFixture<AwardTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AwardTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
