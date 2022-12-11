import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResignModalComponent } from './resign-modal.component';

describe('ResignModalComponent', () => {
  let component: ResignModalComponent;
  let fixture: ComponentFixture<ResignModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResignModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResignModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
