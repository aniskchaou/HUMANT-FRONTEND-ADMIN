import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OfferLetterComponent } from './offer-letter.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [OfferLetterComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: OfferLetterComponent }])
  ],
  exports: [OfferLetterComponent]
})
export class OfferLetterModule {}
