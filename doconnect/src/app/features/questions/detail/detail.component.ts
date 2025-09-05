import { Component, OnInit } from '@angular/core';
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
export class DetailComponent implements OnInit {
  q: QuestionDto | null = null;
  answers: AnswerDto[] = [];
  f: FormGroup;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private qs: QuestionService,
    private admin: AdminService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {
    this.f = this.fb.group({ body: ['', Validators.required] });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') as string;

    this.qs.getQuestion(id).subscribe((res: any) => {
      if (res?.question) {
        this.q = res.question as QuestionDto;
        this.answers = res.answers || [];
      } else {
        this.q = res as QuestionDto;
        this.qs.getAnswers(id).subscribe(a => this.answers = a || []);
      }
    });
  }

  asUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const rel = path.startsWith('/') ? path : `/${path}`;
    return `${environment.apiOrigin}${rel}`;
  }

  onFiles(e: Event) {
    const input = e.target as HTMLInputElement;
    this.selectedFiles = input.files ? Array.from(input.files) : [];
    this.previewUrls = this.selectedFiles.map(f => URL.createObjectURL(f));
  }

  removeFile(i: number) {
    this.selectedFiles.splice(i, 1);
    this.previewUrls.splice(i, 1);
  }

  post() {
    if (this.f.invalid) return;
    const id = this.route.snapshot.paramMap.get('id') as string;

    this.loading = true;
    const fd = new FormData();
    fd.append('Text', this.f.value.body);
    this.selectedFiles.forEach(file => fd.append('Files', file, file.name));

    this.admin.postAnswerForm(id, fd).subscribe({
      next: ans => this.onPosted(ans, true),
      error: (err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 403) {
          this.qs.postAnswer(id, fd).subscribe({
            next: ans => this.onPosted(ans, false),
            error: e2 => {
              this.loading = false;
              console.error(e2);
              this.snack.open('Failed to post answer', 'ok', { duration: 2000 });
            }
          });
        } else {
          this.loading = false;
          console.error(err);
          this.snack.open('Failed to post answer', 'ok', { duration: 2000 });
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
    this.f.reset();
    this.selectedFiles = [];
    this.previewUrls = [];
    this.loading = false;
    this.snack.open(wasAdmin ? 'Answer posted (approved)' : 'Answer posted (pending review)', 'ok', { duration: 1600 });
  }
}
