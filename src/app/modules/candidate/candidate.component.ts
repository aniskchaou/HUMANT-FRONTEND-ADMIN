import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

const STATUSES = ['APPLIED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED', 'HIRED'];

@Component({
  selector: 'app-candidate',
  templateUrl: './candidate.component.html',
  styleUrls: ['./candidate.component.css']
})
export class CandidateComponent implements OnInit {
  candidates: any[] = [];
  loading = false;
  saving = false;
  showForm = false;
  editingId: number | null = null;
  statusUpdatingId: number | null = null;
  uploadingId: number | null = null;
  selectedFile: File | null = null;
  error = '';
  successMsg = '';
  readonly statuses = STATUSES;
  form: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      status: ['APPLIED', Validators.required]
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.http.get<any[]>('/api/candidates').subscribe({
      next: data => { this.candidates = data; this.loading = false; },
      error: () => { this.error = 'Failed to load candidates.'; this.loading = false; }
    });
  }

  openCreate() {
    this.editingId = null;
    this.form.reset({ status: 'APPLIED' });
    this.showForm = true;
    this.error = '';
    this.successMsg = '';
  }

  openEdit(c: any) {
    this.editingId = c.id;
    this.form.patchValue({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone, status: c.status });
    this.showForm = true;
    this.error = '';
    this.successMsg = '';
  }

  cancel() {
    this.showForm = false;
    this.editingId = null;
  }

  save() {
    if (this.form.invalid) { return; }
    this.saving = true;
    const body = this.form.value;
    const req = this.editingId
      ? this.http.put(`/api/candidates/${this.editingId}`, body)
      : this.http.post('/api/candidates', body);
    req.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.successMsg = 'Saved.'; this.load(); },
      error: () => { this.saving = false; this.error = 'Save failed.'; }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this candidate?')) { return; }
    this.http.delete(`/api/candidates/${id}`).subscribe({ next: () => this.load() });
  }

  changeStatus(c: any, status: string) {
    this.statusUpdatingId = c.id;
    this.http.patch(`/api/candidates/${c.id}/status?status=${status}`, {}).subscribe({
      next: () => { this.statusUpdatingId = null; this.load(); },
      error: () => { this.statusUpdatingId = null; this.error = 'Status update failed.'; }
    });
  }

  onFileSelect(event: Event, candidateId: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadResume(candidateId);
    }
  }

  uploadResume(candidateId: number) {
    if (!this.selectedFile) { return; }
    this.uploadingId = candidateId;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this.http.post(`/api/candidates/${candidateId}/resume`, formData).subscribe({
      next: () => { this.uploadingId = null; this.selectedFile = null; this.successMsg = 'Resume uploaded.'; this.load(); },
      error: () => { this.uploadingId = null; this.error = 'Resume upload failed.'; }
    });
  }
}
