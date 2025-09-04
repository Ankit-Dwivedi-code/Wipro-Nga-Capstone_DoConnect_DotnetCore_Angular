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
import { QuestionService, AnswerDto, QuestionDto } from '../../../core/question.service';
import { AdminService } from '../../../core/admin.service';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-question-detail',
  imports: [
    CommonModule, MatCardModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule
  ],
  template: `
    <mat-card *ngIf="q">
      <h2>{{ q.title }}</h2>
      <p>{{ q.text }}</p>
      <div class="imgs" *ngIf="q.images?.length">
        <img *ngFor="let img of q.images" [src]="asUrl(img)" alt="question image" />
      </div>
      <small>By {{ q.author || 'Anon' }} • {{ q.createdAt | date }}</small>
    </mat-card>

    <mat-card *ngIf="answers?.length">
      <h3>Answers</h3>
      <div *ngFor="let a of answers" class="answer">
        <p>{{ a.text }}</p>
        <div class="imgs" *ngIf="a.images?.length">
          <img *ngFor="let im of a.images" [src]="asUrl(im)" alt="answer image" />
        </div>
        <small>
          By {{ a.author || 'Anon' }} • {{ a.createdAt ? (a.createdAt | date:'short') : '' }}
          <span *ngIf="a.status && a.status !== 'Approved'"> • ({{ a.status }})</span>
        </small>
      </div>
    </mat-card>

    <mat-card>
      <form [formGroup]="f" (ngSubmit)="post()">
        <mat-form-field class="full">
          <mat-label>Your answer</mat-label>
          <textarea matInput rows="4" formControlName="body"></textarea>
        </mat-form-field>
        <input type="file" multiple (change)="onFiles($event)" style="margin:8px 0;" />
        <button mat-flat-button color="primary" [disabled]="f.invalid">Post answer</button>
      </form>
    </mat-card>
  `,
  styles: [`
    .full{width:100%}
    .answer{padding:8px 0;border-bottom:1px solid #eee}
    .imgs{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
    .imgs img{max-width:160px;max-height:120px;object-fit:cover;border-radius:6px;border:1px solid #e5e5e5}
  `]
})
export class DetailComponent implements OnInit {
  q: QuestionDto | null = null;
  answers: AnswerDto[] = [];
  f: FormGroup;
  private selectedFiles: File[] = [];

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

    // Be resilient to either `{question, answers}` or `QuestionDto` only
    this.qs.getQuestion(id).subscribe((res: any) => {
      if (res?.question) {
        this.q = res.question as QuestionDto;
        this.answers = res.answers || [];
      } else {
        this.q = res as QuestionDto;
        // If your /questions/{id} doesn’t return answers, fetch them:
        this.qs.getAnswers(id).subscribe(a => this.answers = a || []);
      }
    });
  }

  // Convert '/uploads/xxx' -> 'http://localhost:5108/uploads/xxx'
  asUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // normalize leading slash
    const rel = path.startsWith('/') ? path : `/${path}`;
    return `${environment.apiOrigin}${rel}`;
  }

  onFiles(e: Event) {
    const input = e.target as HTMLInputElement;
    this.selectedFiles = input.files ? Array.from(input.files) : [];
  }

  post() {
    if (this.f.invalid) return;
    const id = this.route.snapshot.paramMap.get('id') as string;

    const fd = new FormData();
    fd.append('Text', this.f.value.body);
    this.selectedFiles.forEach(file => fd.append('Files', file, file.name));

    // Try admin endpoint first (if logged-in admin this will approve immediately)
    this.admin.postAnswerForm(id, fd).subscribe({
      next: ans => this.onPosted(ans, /*wasAdmin*/ true),
      error: (err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 403) {
          // Fallback to user endpoint (Pending)
          this.qs.postAnswer(id, fd).subscribe({
            next: ans => this.onPosted(ans, /*wasAdmin*/ false),
            error: e2 => { console.error(e2); this.snack.open('Failed to post answer', 'ok', { duration: 2000 }); }
          });
        } else {
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
    this.snack.open(wasAdmin ? 'Answer posted (approved)' : 'Answer posted (pending review)', 'ok', { duration: 1600 });
  }
}
