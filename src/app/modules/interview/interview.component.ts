import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

const INTERVIEW_STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

@Component({
  selector: 'app-interview',
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.css']
})
export class InterviewComponent implements OnInit {
  interviews: any[] = [];
  candidates: any[] = [];
  loading = false;
  saving = false;
  showForm = false;
  editingId: number | null = null;
  feedbackId: number | null = null;
  feedbackText = '';
  savingFeedback = false;
  error = '';
  successMsg = '';
  readonly statuses = INTERVIEW_STATUSES;
  form: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.form = this.fb.group({
      candidateId: ['', Validators.required],
      scheduledAt: ['', Validators.required],
      location: [''],
      interviewerName: ['', Validators.required],
      status: ['SCHEDULED', Validators.required]
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
    this.http.get<any[]>('/api/interviews').subscribe({
      next: data => { this.interviews = data; this.loading = false; },
      error: () => { this.error = 'Failed to load interviews.'; this.loading = false; }
    });
  }

  openCreate() {
    this.editingId = null;
    this.form.reset({ status: 'SCHEDULED' });
    this.showForm = true;
    this.error = '';
    this.successMsg = '';
  }

  openEdit(interview: any) {
    this.editingId = interview.id;
    const scheduled = interview.scheduledAt ? interview.scheduledAt.substring(0, 16) : '';
    this.form.patchValue({
      candidateId: interview.candidate?.id || '',
      scheduledAt: scheduled,
      location: interview.location,
      interviewerName: interview.interviewerName,
      status: interview.status
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
      ? this.http.put(`/api/interviews/${this.editingId}`, body)
      : this.http.post('/api/interviews', body);
    req.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.successMsg = 'Saved.'; this.load(); },
      error: () => { this.saving = false; this.error = 'Save failed.'; }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this interview?')) { return; }
    this.http.delete(`/api/interviews/${id}`).subscribe({ next: () => this.load() });
  }

  openFeedback(interview: any) {
    this.feedbackId = interview.id;
    this.feedbackText = interview.feedback || '';
  }

  saveFeedback() {
    if (this.feedbackId === null) { return; }
    this.savingFeedback = true;
    const interview = this.interviews.find(i => i.id === this.feedbackId);
    const body = { ...interview, feedback: this.feedbackText };
    this.http.put(`/api/interviews/${this.feedbackId}`, body).subscribe({
      next: () => { this.savingFeedback = false; this.feedbackId = null; this.successMsg = 'Feedback saved.'; this.load(); },
      error: () => { this.savingFeedback = false; this.error = 'Feedback save failed.'; }
    });
  }

  cancelFeedback() { this.feedbackId = null; }

  candidateName(interview: any): string {
    if (interview.candidate) {
      return `${interview.candidate.firstName || ''} ${interview.candidate.lastName || ''}`.trim();
    }
    return '—';
  }
}
