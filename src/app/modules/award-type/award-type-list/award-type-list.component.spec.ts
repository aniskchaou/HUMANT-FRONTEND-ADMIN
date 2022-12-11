import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwardTypeListComponent } from './award-type-list.component';

describe('AwardTypeListComponent', () => {
  let component: AwardTypeListComponent;
  let fixture: ComponentFixture<AwardTypeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AwardTypeListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
