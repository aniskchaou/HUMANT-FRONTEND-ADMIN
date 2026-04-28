import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipelineComponent } from './pipeline.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [PipelineComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: PipelineComponent }])
  ],
  exports: [PipelineComponent]
})
export class PipelineModule {}
