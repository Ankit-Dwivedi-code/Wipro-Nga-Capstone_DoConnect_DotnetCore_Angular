import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { QuestionService, AnswerDto, QuestionDto } from '../../../core/question.service';
import { AdminService } from '../../../core/admin.service';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-question-detail',
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSnackBarModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy {
  q: QuestionDto | null = null;
  answers: AnswerDto[] = [];
  viewerUrl: string | null = null;

  /** Only the question’s own images (answer images filtered out) */
  questionImages: string[] = [];

  // Form: body is REQUIRED, images are optional (handled outside the form)
  f: FormGroup;

  // Image selection & previews (for the answer form)
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  fileErrors: string[] = [];
  isDragOver = false;

  // Upload constraints
  maxFiles = 6;
  maxMb = 3; // per file
  allowedTypes = ['image/png', 'image/jpeg'];

  loading = false;

  constructor(
    private route: ActivatedRoute,
    private qs: QuestionService,
    private admin: AdminService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {
    this.f = this.fb.group({
      body: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(4000)]]
    });
  }

  ngOnInit() {
    const id = this.getId();

    this.qs.getQuestion(id).subscribe((res: any) => {
      if (res?.question) {
        this.q = res.question as QuestionDto;
        this.answers = res.answers || [];
        this.recomputeQuestionImages();
      } else {
        this.q = res as QuestionDto;
        // compute once in case there are no answers
        this.recomputeQuestionImages();

        // If your /questions/{id} doesn’t return answers, fetch them:
        this.qs.getAnswers(id).subscribe(a => {
          this.answers = a || [];
          this.recomputeQuestionImages();
        });
      }
    });
  }

  ngOnDestroy(): void {
    // Revoke all object URLs to avoid memory leaks
    this.previewUrls.forEach(u => URL.revokeObjectURL(u));
  }

   openViewer(url: string) {
    this.viewerUrl = url;
    // Optional: prevent body scroll while viewer is open
    document.body.style.overflow = 'hidden';
  }

  closeViewer() {
    this.viewerUrl = null;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.viewerUrl) this.closeViewer();
  }

  /** Build a list of images that belong only to the question (exclude any found on answers) */
  private recomputeQuestionImages() {
    const qImgs = (this.q?.images || []) as string[];
    const ansImgs = new Set(
      (this.answers || []).flatMap(a => (a?.images || []) as string[])
    );
    this.questionImages = qImgs.filter(p => !ansImgs.has(p));
  }

  // ---------- Helpers ----------
  private getId(): string {
    return this.route.snapshot.paramMap.get('id') as string;
  }

  asUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const rel = path.startsWith('/') ? path : `/${path}`;
    return `${environment.apiOrigin}${rel}`;
  }

  // ---------- Files: click-select ----------
  onFiles(e: Event) {
    const input = e.target as HTMLInputElement;
    const list = input.files ? Array.from(input.files) : [];
    this.pushFiles(list);
    // allow selecting the same file again later
    if (input) input.value = '';
  }

  // ---------- Files: drag & drop ----------
  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDragOver = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragOver = false;
    const list = e.dataTransfer?.files;
    if (!list || list.length === 0) return;
    this.pushFiles(Array.from(list));
  }

  // Centralized file intake with validation
  private pushFiles(incoming: File[]) {
    const remaining = this.maxFiles - this.selectedFiles.length;
    const toAdd = incoming.slice(0, Math.max(0, remaining));

    const newErrors: string[] = [];
    for (const f of toAdd) {
      if (!this.allowedTypes.includes(f.type)) {
        newErrors.push(`${f.name}: unsupported type`);
        continue;
      }
      if (f.size > this.maxMb * 1024 * 1024) {
        newErrors.push(`${f.name}: exceeds ${this.maxMb}MB`);
        continue;
      }

      this.selectedFiles.push(f);
      this.previewUrls.push(URL.createObjectURL(f));
    }

    if (incoming.length > toAdd.length) {
      newErrors.push(`Only ${this.maxFiles} images allowed.`);
    }

    this.fileErrors = newErrors.slice(0, 3);
  }

  removeFile(i: number) {
    const url = this.previewUrls[i];
    if (url) URL.revokeObjectURL(url);
    this.selectedFiles.splice(i, 1);
    this.previewUrls.splice(i, 1);
  }

  clearFiles() {
    this.previewUrls.forEach(u => URL.revokeObjectURL(u));
    this.selectedFiles = [];
    this.previewUrls = [];
    this.fileErrors = [];
  }

  // ---------- Submit ----------
  post() {
    if (this.f.invalid) {
      this.f.markAllAsTouched();
      this.snack.open('Please write your answer before posting.', 'ok', { duration: 1600 });
      return;
    }

    const id = this.getId();
    this.loading = true;

    const fd = new FormData();
    fd.append('Text', this.f.value.body);
    this.selectedFiles.forEach(file => fd.append('Files', file, file.name));

    // Try admin endpoint first; if unauthorized/forbidden, fall back to user endpoint
    this.admin.postAnswerForm(id, fd).subscribe({
      next: ans => this.onPosted(ans, true),
      error: (err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 403) {
          this.qs.postAnswer(id, fd).subscribe({
            next: ans => this.onPosted(ans, false),
            error: e2 => this.onPostError(e2)
          });
        } else {
          this.onPostError(err);
        }
      }
    });
  }

  private onPosted(ans: any, wasAdmin: boolean) {
    const normalized: AnswerDto = {
      id: ans?.id ?? ans?.Id,
      text: ans?.text ?? ans?.Text,
      author: ans?.author ?? ans?.Author ?? (wasAdmin ? 'Admin' : 'You'),
      createdAt: ans?.createdAt ?? ans?.CreatedAt ?? new Date().toISOString(),
      status: ans?.status ?? ans?.Status ?? (wasAdmin ? 'Approved' : 'Pending'),
      images: ans?.images ?? ans?.Images ?? []
    };

    this.answers.unshift(normalized);
    // keep the top gallery clean after posting
    this.recomputeQuestionImages();

    this.f.reset();
    this.clearFiles();
    this.loading = false;

    this.snack.open(
      wasAdmin ? 'Answer posted (approved)' : 'Answer posted (pending review)',
      'ok',
      { duration: 1600 }
    );
  }

  private onPostError(err: any) {
    this.loading = false;
    console.error(err);
    this.snack.open('Failed to post answer', 'ok', { duration: 2000 });
  }
}
