import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-pipeline',
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.css']
})
export class PipelineComponent implements OnInit {
  readonly stages = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];
  stagesMap: { [stage: string]: any[] } = {};
  candidates: any[] = [];
  loading = false;
  showAddForm = false;
  saving = false;
  error = '';
  successMsg = '';
  addForm: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.addForm = this.fb.group({
      candidateId: ['', Validators.required],
      stage: ['APPLIED', Validators.required],
      notes: ['']
    });
    this.stages.forEach(s => this.stagesMap[s] = []);
  }


  ngOnInit(): void {
    this.http.get<any[]>('/api/candidates').subscribe({ next: d => this.candidates = d });
    this.load();
  }

  load() {
    this.loading = true;
    this.stages.forEach(s => this.stagesMap[s] = []);
    this.http.get<any[]>('/api/pipelines').subscribe({
      next: data => {
        data.forEach(entry => {
          const s = entry.stage as string;
          if (this.stagesMap[s]) { this.stagesMap[s].push(entry); }
        });
        this.loading = false;
      },
      error: () => { this.error = 'Failed to load pipeline.'; this.loading = false; }
    });
  }

  candidateName(entry: any): string {
    if (entry.candidate) {
      return `${entry.candidate.firstName || ''} ${entry.candidate.lastName || ''}`.trim();
    }
    return '—';
  }

  moveToStage(entry: any, newStage: string) {
    if (entry.stage === newStage) { return; }
    this.http.patch(`/api/pipelines/${entry.id}/stage?stage=${newStage}`, {}).subscribe({
      next: () => { this.successMsg = `Moved to ${newStage}`; this.load(); },
      error: () => { this.error = 'Failed to move candidate.'; }
    });
  }

  removeEntry(id: number) {
    if (!confirm('Remove this entry from the pipeline?')) { return; }
    this.http.delete(`/api/pipelines/${id}`).subscribe({ next: () => this.load() });
  }

  addEntry() {
    if (this.addForm.invalid) { return; }
    this.saving = true;
    const v = this.addForm.value;
    const body = { candidate: { id: v.candidateId }, stage: v.stage, notes: v.notes };
    this.http.post('/api/pipelines', body).subscribe({
      next: () => {
        this.saving = false;
        this.showAddForm = false;
        this.addForm.reset({ stage: 'APPLIED' });
        this.successMsg = 'Added to pipeline.';
        this.load();
      },
      error: () => { this.saving = false; this.error = 'Failed to add entry.'; }
    });
  }

  stagesExcluding(current: string): string[] {
    return this.stages.filter(s => s !== current);
  }
}
