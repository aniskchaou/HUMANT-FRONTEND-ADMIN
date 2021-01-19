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
import { CreditComponent } from './modules/credit/credit.component';
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
import { EditHolidayComponent } from './modules/holiday/edit-holiday/edit-holiday.component';
import { HolidayComponent } from './modules/holiday/holiday/holiday.component';
import { ViewHolidayComponent } from './modules/holiday/view-holiday/view-holiday.component';
import { AddHolidayComponent } from './modules/holiday/add-holiday/add-holiday.component';
import { AddLeaveComponent } from './modules/leave/add-leave/add-leave.component';
import { LeaveComponent } from './modules/leave/leave/leave.component';
import { ViewLeaveComponent } from './modules/leave/view-leave/view-leave.component';
import { EditLeaveComponent } from './modules/notice/edit-leave/edit-leave.component';

import { PresenceComponent } from './modules/presence/presence/presence.component';
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
import { AddWarningComponent } from './modules/warning/add-warning/add-warning.component';
import { EditWarningComponent } from './modules/warning/edit-warning/edit-warning.component';
import { ViewWarningComponent } from './modules/warning/view-warning/view-warning.component';
import { WarningComponent } from './modules/warning/warning/warning.component';
import { ConfigurationComponent } from './modules/shared/configuration/configuration.component';
import { DashboardComponent } from './modules/shared/dashboard/dashboard.component';
import { EditprofileComponent } from './modules/shared/editprofile/editprofile.component';
import { LoginComponent } from './modules/shared/login/login.component';
import { ProfileComponent } from './modules/shared/profile/profile.component';

import { AddNoteComponent } from './add-note/add-note.component';
import { AddAwardComponent } from './add-award/add-award.component';
import { AddNoticeComponent } from './notice/add-notice/add-notice.component';



const routes:Routes=[

  {path:'advance',component:AdvanceComponent,pathMatch:'full'},
  {path:'award',component:AwardComponent,pathMatch:'full'},
  {path:'complain',component:ComplainComponent,pathMatch:'full'},
  {path:'configuration',component:ConfigurationComponent,pathMatch:'full'},
  {path:'credit',component:CreditComponent,pathMatch:'full'},
  {path:'departement',component:DepartementComponent,pathMatch:'full'},
  {path:'designation',component:DesignationComponent,pathMatch:'full'},
  {path:'employee',component:EmployeeComponent,pathMatch:'full'},
  {path:'holiday',component:HolidayComponent,pathMatch:'full'},
  {path:'leave',component:LeaveComponent,pathMatch:'full'},
  //{path:'notice',component:NoticeComponent,pathMatch:'full'},
  {path:'presence',component:PresenceComponent,pathMatch:'full'},
  {path:'resign',component:ResignComponent,pathMatch:'full'},
  {path:'salary',component:SalaryComponent,pathMatch:'full'},
  {path:'termination',component:TerminationComponent,pathMatch:'full'},
  {path:'training',component:TrainingComponent,pathMatch:'full'},
  {path:'transfert',component:TransfertComponent,pathMatch:'full'},
  {path:'warning',component:WarningComponent,pathMatch:'full'},
  {path:'dashboard',component:DashboardComponent,pathMatch:'full'},
  {path:'login',component:LoginComponent,pathMatch:'full'},
  {path:'profile',component:ProfileComponent,pathMatch:'full'},
  {path:'editprofile',component:EditprofileComponent,pathMatch:'full'},
  {path:'',redirectTo:'login',pathMatch:'full'},
  {path:'**',redirectTo:'login',pathMatch:'full'}]


@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    DashboardComponent,
    EmployeeComponent,
    PresenceComponent,
    AwardComponent,
    TransfertComponent,
    ComplainComponent,
    WarningComponent,
    ResignComponent,
    HolidayComponent,
    TerminationComponent,
    //NoticeComponent,
    LeaveComponent,
    TrainingComponent,
    AdvanceComponent,
    CreditComponent,
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
    AddWarningComponent,
    AddResignationComponent,
    AddTerminationComponent,
    AddHolidayComponent,
    AddLeaveComponent,
    AddTrainingComponent,
    AddAdvanceSalaryComponent,
    AddSalaryComponent,
    AddDepartementComponent,
    AddDesignationComponent,
    EditAdvanceSalaryComponent,
    EditComplaintComponent,
    EditDepartementComponent,
    EditHolidayComponent,
    EditLeaveComponent,
    EditResignationComponent,
    EditSalaryComponent,
    EditTerminationComponent,
    EditTrainingComponent,
    EditTransfertComponent,
    EditWarningComponent,
    ViewAdvanceSalaryComponent,
    ViewComplaintComponent,
    ViewDepartementComponent,
    ViewDesignationComponent,
    ViewHolidayComponent,
    ViewLeaveComponent,
    ViewResignationComponent,
    ViewSalaryComponent,
    ViewTerminationComponent,
    ViewTrainingComponent,
    ViewTransertComponent,
    ViewWarningComponent,
    AddAwardComponent,
    AddNoteComponent,
    AddNoticeComponent
    
    
  ],
  imports: [
    DataTablesModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  providers: [{provide: APP_BASE_HREF, useValue: ''}],
  bootstrap: [AppComponent]
})
export class AppModule { }
