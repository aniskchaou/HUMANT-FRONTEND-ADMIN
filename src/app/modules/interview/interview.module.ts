import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InterviewComponent } from './interview.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [InterviewComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: InterviewComponent }])
  ],
  exports: [InterviewComponent]
})
export class InterviewModule {}
