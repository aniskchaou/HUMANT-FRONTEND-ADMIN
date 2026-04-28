import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ConfigurationComponent } from './configuration.component';
import { HTTPService } from 'src/app/main/services/HTTPService';
import { URLLoader } from 'src/app/main/configs/URLLoader';

describe('ConfigurationComponent', () => {
  let component: ConfigurationComponent;
  let fixture: ComponentFixture<ConfigurationComponent>;
  let httpServiceSpy: jasmine.SpyObj<HTTPService>;

  beforeEach(async () => {
    httpServiceSpy = jasmine.createSpyObj('HTTPService', [
      'getAll',
      'putWithResponse',
      'postWithResponse',
      'remove',
    ]);

    httpServiceSpy.getAll.and.callFake((url: string) => {
      if (url.indexOf('/api/workspace-configuration') !== -1) {
        return of({
          companyName: 'Humant HR Workspace',
          companyEmail: 'operations@humant.local',
          companyAddress: 'Head office administration floor',
          language: 'English',
          currency: 'USD',
          timezone: 'UTC',
          payrollCutoffDay: '25',
          approvalMode: 'Two-step review',
          payslipSignature: 'HR Operations Lead',
          notificationMode: 'Email and in-app alerts',
          autoLeaveBalanceEnabled: true,
          autoPayrollEnabled: true,
          customApprovalFlowsEnabled: true,
          ruleBasedTriggersEnabled: true,
          reminderWindowDays: '30',
          approvalStages: 'Manager review -> HR approval',
          updatedAt: '',
        });
      }

      return of([]);
    });
    httpServiceSpy.putWithResponse.and.returnValue(Promise.resolve(null));
    httpServiceSpy.postWithResponse.and.returnValue(Promise.resolve(null));
    httpServiceSpy.remove.and.returnValue(Promise.resolve());

    spyOn(URLLoader.prototype, 'loadScripts').and.stub();

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ConfigurationComponent],
      providers: [{ provide: HTTPService, useValue: httpServiceSpy }],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
