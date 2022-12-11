import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NavigationComponent } from './template/navigation/navigation.component';

import { RouterModule, Routes } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { AddAdvanceSalaryComponent } from './modules/advance salary/add-advance-salary/add-advance-salary.component';
import { AdvanceComponent } from './modules/advance salary/advance/advance.component';
import { EditAdvanceSalaryComponent } from './modules/advance salary/edit-advance-salary/edit-advance-salary.component';
import { ViewAdvanceSalaryComponent } from './modules/advance salary/view-advance-salary/view-advance-salary.component';
import { AwardComponent } from './modules/award/award/award.component';
import { AddComplaintComponent } from './modules/complaint/add-complaint/add-complaint.component';
import { ComplainComponent } from './modules/complaint/complain/complain.component';
import { EditComplaintComponent } from './modules/complaint/edit-complaint/edit-complaint.component';
import { ViewComplaintComponent } from './modules/complaint/view-complaint/view-complaint.component';
import { AddDepartementComponent } from './modules/departement/add-departement/add-departement.component';
import { DepartementComponent } from './modules/departement/departement/departement.component';
import { EditDepartementComponent } from './modules/departement/edit-departement/edit-departement.component';
import { ViewDepartementComponent } from './modules/departement/view-departement/view-departement.component';
import { AddDesignationComponent } from './modules/designation/add-designation/add-designation.component';
import { DesignationComponent } from './modules/designation/designation/designation.component';
import { ViewDesignationComponent } from './modules/designation/view-designation/view-designation.component';
import { AddEmployeeComponent } from './modules/employee/add-employee/add-employee.component';
import { EditEmployeeComponent } from './modules/employee/edit-employee/edit-employee.component';
import { EmployeeComponent } from './modules/employee/employee/employee.component';
import { ViewEmployeeComponent } from './modules/employee/view-employee/view-employee.component';

import { AddLeaveComponent } from './modules/leave/add-leave/add-leave.component';
import { LeaveComponent } from './modules/leave/leave/leave.component';
import { ViewLeaveComponent } from './modules/leave/view-leave/view-leave.component';
import { AddResignationComponent } from './modules/resign/add-resignation/add-resignation.component';
import { EditResignationComponent } from './modules/resign/edit-resignation/edit-resignation.component';
import { ResignComponent } from './modules/resign/resign/resign.component';
import { ViewResignationComponent } from './modules/resign/view-resignation/view-resignation.component';
import { AddSalaryComponent } from './modules/salary/add-salary/add-salary.component';
import { EditSalaryComponent } from './modules/salary/edit-salary/edit-salary.component';
import { SalaryComponent } from './modules/salary/salary/salary.component';
import { ViewSalaryComponent } from './modules/salary/view-salary/view-salary.component';
import { AddTerminationComponent } from './modules/termination/add-termination/add-termination.component';
import { EditTerminationComponent } from './modules/termination/edit-termination/edit-termination.component';
import { TerminationComponent } from './modules/termination/termination/termination.component';
import { ViewTerminationComponent } from './modules/termination/view-termination/view-termination.component';
import { AddTrainingComponent } from './modules/training/add-training/add-training.component';
import { EditTrainingComponent } from './modules/training/edit-training/edit-training.component';
import { TrainingComponent } from './modules/training/training/training.component';
import { ViewTrainingComponent } from './modules/training/view-training/view-training.component';
import { AddTransfertComponent } from './modules/transfert/add-transfert/add-transfert.component';
import { EditTransfertComponent } from './modules/transfert/edit-transfert/edit-transfert.component';
import { TransfertComponent } from './modules/transfert/transfert/transfert.component';
import { ViewTransertComponent } from './modules/transfert/view-transert/view-transert.component';
import { ConfigurationComponent } from './modules/shared/configuration/configuration.component';
import { DashboardComponent } from './modules/shared/dashboard/dashboard.component';
import { EditprofileComponent } from './modules/shared/editprofile/editprofile.component';
import { LoginComponent } from './modules/shared/login/login.component';
import { ProfileComponent } from './modules/shared/profile/profile.component';

import { AddAwardComponent } from './modules/award/add-award/add-award.component';
import { AddNoticeComponent } from './modules/notice/add-notice/add-notice.component';
import { UserMenuComponent } from './template/user-menu/user-menu.component';
import { ShortcutMenuComponent } from './template/shortcut-menu/shortcut-menu.component';
import { MessagesComponent } from './template/messages/messages.component';
import { FooterComponent } from './template/footer/footer.component';
import { PathComponent } from './template/path/path.component';
import { ModalAwardComponent } from './modules/award/modal-award/modal-award.component';
import { ModalEmployeeComponent } from './modules/employee/modal-employee/modal-employee.component';
import { AdvanceSalaryListComponent } from './modules/advance salary/advance-salary-list/advance-salary-list.component';
import { AwardListComponent } from './modules/award/award-list/award-list.component';
import { DesignationListComponent } from './modules/designation/designation-list/designation-list.component';
import { DepartementListComponent } from './modules/departement/departement-list/departement-list.component';
import { AdvanceSalaryModalComponent } from './modules/advance salary/advance-salary-modal/advance-salary-modal.component';
import { AwardModalComponent } from './modules/award/award-modal/award-modal.component';
import { EditAwardComponent } from './modules/award/edit-award/edit-award.component';
import { CompainModalComponent } from './modules/complaint/compain-modal/compain-modal.component';
import { EditComplainComponent } from './modules/complaint/edit-complain/edit-complain.component';
import { DepartementModalComponent } from './modules/departement/departement-modal/departement-modal.component';
import { DesignationModalComponent } from './modules/designation/designation-modal/designation-modal.component';
import { EditDesignationComponent } from './modules/designation/edit-designation/edit-designation.component';
import { EmployeeModalComponent } from './modules/employee/employee-modal/employee-modal.component';

import { EditLeaveComponent } from './modules/leave/edit-leave/edit-leave.component';
import { LeaveModalComponent } from './modules/leave/leave-modal/leave-modal.component';
import { EditResignComponent } from './modules/resign/edit-resign/edit-resign.component';
import { ResignModalComponent } from './modules/resign/resign-modal/resign-modal.component';
import { SalaryModalComponent } from './modules/salary/salary-modal/salary-modal.component';
import { TerminationModalComponent } from './modules/termination/termination-modal/termination-modal.component';
import { TrainingModalComponent } from './modules/training/training-modal/training-modal.component';
import { EditTransferComponent } from './modules/transfert/edit-transfer/edit-transfer.component';
import { TransferModalComponent } from './modules/transfert/transfer-modal/transfer-modal.component';
import { EmployeeListComponent } from './modules/employee/employee-list/employee-list.component';

import { LeaveListComponent } from './modules/leave/leave-list/leave-list.component';
import { ResignListComponent } from './modules/resign/resign-list/resign-list.component';
import { SalaryListComponent } from './modules/salary/salary-list/salary-list.component';
import { ComplainListComponent } from './modules/complaint/complain-list/complain-list.component';
import { TrainingListComponent } from './modules/training/training-list/training-list.component';
import { TransfertListComponent } from './modules/transfert/transfert-list/transfert-list.component';
import { TerminationListComponent } from './modules/termination/termination-list/termination-list.component';

import { LoanComponent } from './modules/loan/loan.component';

import { ContractComponent } from './modules/contract/contract/contract.component';
import { PayslipComponent } from './modules/payslip/payslip/payslip.component';
import { LaunchplanComponent } from './modules/launchplan/launch-plan/launchplan.component';
import { LterminationTypeComponent } from './modules/ltermination-type/ltermination-type.component';

import { AwardTypeComponent } from './modules/award-type/award-type/award-type.component';

import { ContractTypeComponent } from './modules/contract-type/contract-type/contract-type.component';
import { JobComponent } from './modules/job/job/job.component';
import { EventComponent } from './modules/event/event/event.component';

import { LeaveTypeComponent } from './modules/leave-type/leave-type.component';
import { AnnouncementComponent } from './modules/announcement/announcement/announcement.component';
import { EducationLevelComponent } from './modules/education-level/education-level/education-level.component';
import { JobApplicationComponent } from './modules/job-application/job-application.component';

import { HolidayComponent } from './modules/holiday/holiday/holiday.component';
import { UserComponent } from './modules/user/user/user.component';
import { WarningComponent } from './modules/warning/warning.component';
import { TrainingTypeComponent } from './modules/training-type/training-type/training-type.component';

import { NoticeListComponent } from './modules/notice/notice-list/notice-list.component';

import { CityComponent } from './modules/city/city/city.component';
import { CountryComponent } from './modules/country/country/country.component';
import { HttpClientModule } from '@angular/common/http';
import { AddAnnouncementComponent } from './modules/announcement/add-announcement/add-announcement.component';
import { AnnouncementModalComponent } from './modules/announcement/announcement-modal/announcement-modal.component';
import { AddEventComponent } from './modules/event/add-event/add-event.component';
import { AddContractComponent } from './modules/contract/add-contract/add-contract.component';
import { AddPayslipComponent } from './modules/payslip/add-payslip/add-payslip.component';
import { AwardTypeModalComponent } from './modules/award-type/award-type-modal/award-type-modal.component';
import { AddLaunchPlanComponent } from './modules/launchplan/add-launch-plan/add-launch-plan.component';
import { AddContractTypeComponent } from './modules/contract-type/add-contract-type/add-contract-type.component';
import { AddJobComponent } from './modules/job/add-job/add-job.component';
import { AddEducationLevelComponent } from './modules/education-level/add-education-level/add-education-level.component';
import { AddUserComponent } from './modules/user/add-user/add-user.component';
import { AddCityComponent } from './modules/city/add-city/add-city.component';
import { AddCountryComponent } from './modules/country/add-country/add-country.component';
import { AddAwardTypeComponent } from './modules/award-type/add-award-type/add-award-type.component';
import { JobModalComponent } from './modules/job/job-modal/job-modal.component';
import { LaunchPlanModalComponent } from './modules/launchplan/launch-plan-modal/launch-plan-modal.component';
import { AwardTypeListComponent } from './modules/award-type/award-type-list/award-type-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AnnouncementListComponent } from './modules/announcement/announcement-list/announcement-list.component';
import { ContractListComponent } from './modules/contract/contract-list/contract-list.component';
import { ContractTypeListComponent } from './modules/contract-type/contract-type-list/contract-type-list.component';
import { EducationLevelListComponent } from './modules/education-level/education-level-list/education-level-list.component';
import { EventListComponent } from './modules/event/event-list/event-list.component';
import { NoticeComponent } from './modules/notice/notice/notice.component';
import { AddTrainingTypeComponent } from './modules/training-type/add-training-type/add-training-type.component';

const routes: Routes = [
  { path: 'country', component: CountryComponent, pathMatch: 'full' },
  { path: 'city', component: CityComponent, pathMatch: 'full' },
  { path: 'advance', component: AdvanceComponent, pathMatch: 'full' },
  { path: 'award', component: AwardComponent, pathMatch: 'full' },
  { path: 'award-type', component: AwardTypeComponent, pathMatch: 'full' },
  { path: 'announcement', component: AnnouncementComponent, pathMatch: 'full' },
  { path: 'complain', component: ComplainComponent, pathMatch: 'full' },
  { path: 'contract', component: ContractComponent, pathMatch: 'full' },
  {
    path: 'contract-type',
    component: ContractTypeComponent,
    pathMatch: 'full',
  },
  {
    path: 'configuration',
    component: ConfigurationComponent,
    pathMatch: 'full',
  },
  { path: 'departement', component: DepartementComponent, pathMatch: 'full' },
  { path: 'designation', component: DesignationComponent, pathMatch: 'full' },
  { path: 'employee', component: EmployeeComponent, pathMatch: 'full' },
  {
    path: 'education-level',
    component: EducationLevelComponent,
    pathMatch: 'full',
  },
  { path: 'event', component: EventComponent, pathMatch: 'full' },
  {
    path: 'job',
    component: JobComponent,
    pathMatch: 'full',
  },
  {
    path: 'launch-plan',
    component: LaunchplanComponent,
    pathMatch: 'full',
  },
  { path: 'holiday', component: HolidayComponent, pathMatch: 'full' },
  { path: 'leave', component: LeaveComponent, pathMatch: 'full' },
  {
    path: 'leave-type',
    component: LeaveTypeComponent,
    pathMatch: 'full',
  },
  {
    path: 'loan',
    component: LoanComponent,
    pathMatch: 'full',
  },
  { path: 'notice', component: NoticeComponent, pathMatch: 'full' },
  { path: 'pay-slip', component: PayslipComponent, pathMatch: 'full' },
  { path: 'resignation', component: ResignComponent, pathMatch: 'full' },
  { path: 'resign', component: ResignComponent, pathMatch: 'full' },
  { path: 'salary', component: SalaryComponent, pathMatch: 'full' },
  { path: 'termination', component: TerminationComponent, pathMatch: 'full' },
  {
    path: 'termination-type',
    component: TerminationComponent,
    pathMatch: 'full',
  },
  { path: 'training', component: TrainingComponent, pathMatch: 'full' },
  {
    path: 'training-type',
    component: TrainingTypeComponent,
    pathMatch: 'full',
  },
  { path: 'transfert', component: TransfertComponent, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent, pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent, pathMatch: 'full' },
  { path: 'editprofile', component: EditprofileComponent, pathMatch: 'full' },
  { path: 'warning', component: WarningComponent, pathMatch: 'full' },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    DashboardComponent,
    EmployeeComponent,
    AwardComponent,
    TransfertComponent,
    ComplainComponent,
    ResignComponent,
    HolidayComponent,
    TerminationComponent,
    NoticeComponent,
    LeaveComponent,
    TrainingComponent,
    AdvanceComponent,
    SalaryComponent,
    DepartementComponent,
    DesignationComponent,
    ConfigurationComponent,
    LoginComponent,
    ProfileComponent,
    EditprofileComponent,
    ViewEmployeeComponent,
    EditEmployeeComponent,
    AddEmployeeComponent,
    AdvanceComponent,
    AddTransfertComponent,
    AddComplaintComponent,
    AddResignationComponent,
    AddTerminationComponent,
    AddSalaryComponent,
    AddLeaveComponent,
    AddTrainingComponent,
    AddAdvanceSalaryComponent,
    AddSalaryComponent,
    AddDepartementComponent,
    AddDesignationComponent,
    EditAdvanceSalaryComponent,
    EditComplaintComponent,
    EditDepartementComponent,
    EditSalaryComponent,
    EditResignationComponent,
    EditSalaryComponent,
    EditTerminationComponent,
    EditTrainingComponent,
    EditTransfertComponent,
    ViewAdvanceSalaryComponent,
    ViewComplaintComponent,
    ViewDepartementComponent,
    ViewDesignationComponent,
    ViewSalaryComponent,
    ViewLeaveComponent,
    ViewResignationComponent,
    ViewSalaryComponent,
    ViewTerminationComponent,
    ViewTrainingComponent,
    ViewTransertComponent,
    AddAwardComponent,
    AddNoticeComponent,
    UserMenuComponent,
    ShortcutMenuComponent,
    MessagesComponent,
    FooterComponent,
    PathComponent,
    ModalAwardComponent,
    ModalEmployeeComponent,
    AdvanceSalaryListComponent,
    AwardListComponent,
    DesignationListComponent,
    DepartementListComponent,
    EditAwardComponent,
    EditComplainComponent,
    EditDesignationComponent,
    EditLeaveComponent,
    EditResignComponent,
    EditTransferComponent,
    AdvanceSalaryModalComponent,
    AwardModalComponent,
    CompainModalComponent,
    DepartementModalComponent,
    DesignationModalComponent,
    EmployeeModalComponent,
    SalaryModalComponent,
    LeaveModalComponent,
    ResignModalComponent,
    SalaryModalComponent,
    TerminationModalComponent,
    TrainingModalComponent,
    TransferModalComponent,
    AwardListComponent,
    SalaryListComponent,
    EmployeeComponent,
    LeaveListComponent,
    ResignListComponent,
    SalaryListComponent,
    ComplainListComponent,
    TrainingListComponent,
    TransfertListComponent,
    TerminationListComponent,
    EmployeeListComponent,

    LoanComponent,
    UserComponent,
    ContractComponent,
    PayslipComponent,
    LaunchplanComponent,
    AwardTypeModalComponent,

    LterminationTypeComponent,
    WarningComponent,
    LeaveTypeComponent,
    AddEventComponent,
    AddContractComponent,
    AddPayslipComponent,
    EventComponent,
    AnnouncementComponent,
    EducationLevelComponent,
    JobComponent,
    JobApplicationComponent,
    ContractTypeComponent,
    TrainingTypeComponent,
    AddTrainingTypeComponent,
    AnnouncementModalComponent,
    AwardTypeComponent,
    CountryComponent,
    AddLaunchPlanComponent,
    AddContractTypeComponent,
    AddJobComponent,
    AddEducationLevelComponent,
    AddUserComponent,
    AddCityComponent,
    AddCountryComponent,
    AddAwardTypeComponent,
    JobModalComponent,
    LaunchPlanModalComponent,
    CityComponent,
    AddAnnouncementComponent,
    AnnouncementListComponent,
    AwardTypeListComponent,
    ContractListComponent,
    ContractTypeListComponent,
    EducationLevelListComponent,
    EventListComponent,
  ],
  imports: [
    HttpClientModule,
    DataTablesModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    RouterModule.forRoot(routes),
  ],
  providers: [{ provide: APP_BASE_HREF, useValue: '' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
