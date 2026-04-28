import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CandidateComponent } from './candidate.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [CandidateComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: CandidateComponent }])
  ],
  exports: [CandidateComponent]
})
export class CandidateModule {}
