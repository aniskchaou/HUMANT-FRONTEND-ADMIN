import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NavigationComponent } from './template/navigation/navigation.component';

import { RouterModule, Routes } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { DashboardComponent } from './content/dashboard/dashboard.component';
import { EmployeeComponent } from './content/employee/employee.component';
import { PresenceComponent } from './content/presence/presence.component';
import { AwardComponent } from './content/award/award.component';
import { TransfertComponent } from './content/transfert/transfert.component';
import { ComplainComponent } from './content/complain/complain.component';
import { WarningComponent } from './content/warning/warning.component';
import { ResignComponent } from './content/resign/resign.component';
import { HolidayComponent } from './content/holiday/holiday.component';
import { TerminationComponent } from './content/termination/termination.component';
import { NoticeComponent } from './content/notice/notice.component';
import { LeaveComponent } from './content/leave/leave.component';
import { TrainingComponent } from './content/training/training.component';
import { AdvanceComponent } from './content/advance/advance.component';
import { CreditComponent } from './content/credit/credit.component';
import { SalaryComponent } from './content/salary/salary.component';
import { DepartementComponent } from './content/departement/departement.component';
import { DesignationComponent } from './content/designation/designation.component';
import { ConfigurationComponent } from './content/configuration/configuration.component';
import { LoginComponent } from './content/login/login.component';
import { ProfileComponent } from './content/profile/profile.component';
import { EditprofileComponent } from './content/editprofile/editprofile.component';

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
  {path:'notice',component:NoticeComponent,pathMatch:'full'},
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
    NoticeComponent,
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
    
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  providers: [{provide: APP_BASE_HREF, useValue: ''}],
  bootstrap: [AppComponent]
})
export class AppModule { }
