import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-offer-letter',
  templateUrl: './offer-letter.component.html',
  styleUrls: ['./offer-letter.component.css']
})
export class OfferLetterComponent implements OnInit {
  offerLetters: any[] = [];
  candidates: any[] = [];
  loading = false;
  saving = false;
  showForm = false;
  editingId: number | null = null;
  error = '';
  successMsg = '';
  form: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.form = this.fb.group({
      candidateId: ['', Validators.required],
      positionOffered: ['', Validators.required],
      salaryOffered: ['', Validators.required],
      issueDate: ['', Validators.required],
      termsAndConditions: ['']
    });
  }

  ngOnInit(): void {
    this.loadCandidates();
    this.load();
  }

  loadCandidates() {
    this.http.get<any[]>('/api/candidates').subscribe({ next: data => this.candidates = data });
  }

  load() {
    this.loading = true;
    this.http.get<any[]>('/api/offer-letters').subscribe({
      next: data => { this.offerLetters = data; this.loading = false; },
      error: () => { this.error = 'Failed to load offer letters.'; this.loading = false; }
    });
  }

  openCreate() {
    this.editingId = null;
    this.form.reset();
    this.showForm = true;
    this.error = '';
    this.successMsg = '';
  }

  openEdit(ol: any) {
    this.editingId = ol.id;
    this.form.patchValue({
      candidateId: ol.candidate?.id || '',
      positionOffered: ol.positionOffered,
      salaryOffered: ol.salaryOffered,
      issueDate: ol.issueDate,
      termsAndConditions: ol.termsAndConditions
    });
    this.showForm = true;
  }

  cancel() { this.showForm = false; this.editingId = null; }

  save() {
    if (this.form.invalid) { return; }
    this.saving = true;
    const v = this.form.value;
    const body = { ...v, candidate: { id: v.candidateId } };
    delete body.candidateId;
    const req = this.editingId
      ? this.http.put(`/api/offer-letters/${this.editingId}`, body)
      : this.http.post('/api/offer-letters', body);
    req.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.successMsg = 'Offer letter saved.'; this.load(); },
      error: () => { this.saving = false; this.error = 'Save failed.'; }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this offer letter?')) { return; }
    this.http.delete(`/api/offer-letters/${id}`).subscribe({ next: () => this.load() });
  }

  markHired(candidateId: number) {
    this.http.patch(`/api/candidates/${candidateId}/status?status=HIRED`, {}).subscribe({
      next: () => { this.successMsg = 'Candidate marked as hired!'; this.load(); },
      error: () => { this.error = 'Could not update candidate status.'; }
    });
  }

  candidateName(ol: any): string {
    if (ol.candidate) {
      return `${ol.candidate.firstName || ''} ${ol.candidate.lastName || ''}`.trim();
    }
    return '—';
  }
}
