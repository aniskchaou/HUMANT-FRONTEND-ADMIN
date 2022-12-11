import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResignListComponent } from './resign-list.component';

describe('ResignListComponent', () => {
  let component: ResignListComponent;
  let fixture: ComponentFixture<ResignListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResignListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResignListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
