import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LterminationTypeComponent } from './ltermination-type.component';

describe('LterminationTypeComponent', () => {
  let component: LterminationTypeComponent;
  let fixture: ComponentFixture<LterminationTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LterminationTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LterminationTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
