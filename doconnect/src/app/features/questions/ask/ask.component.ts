import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { QuestionService } from '../../../core/question.service';
import { AdminService } from '../../../core/admin.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  selector: 'app-ask',
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSnackBarModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './ask.component.html',
  styleUrls: ['./ask.component.scss']
})
export class AskComponent {
  f: FormGroup;

  // single required file + preview
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private qs: QuestionService,
    private admin: AdminService,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.f = this.fb.group({
      title: ['', Validators.required],
      body: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(4000)]],
      // this control is just for validation/UI; we update it when a file is chosen/removed
      file: [null, Validators.required]
    });
  }

  // handle single file pick
  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;

    // cleanup previous preview
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }

    this.selectedFile = file;

    if (file) {
      this.previewUrl = URL.createObjectURL(file);
      this.f.get('file')?.setValue('picked'); // mark as present for required validator
      this.f.get('file')?.markAsTouched();
    } else {
      this.f.get('file')?.setValue(null);
      this.f.get('file')?.markAsTouched();
    }

    // allow re-selecting the same file
    if (input) input.value = '';
  }

  removeFile() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.selectedFile = null;
    this.previewUrl = null;
    this.f.get('file')?.setValue(null);
    this.f.get('file')?.markAsTouched();
  }

  submit() {
    if (this.f.invalid) {
      this.f.markAllAsTouched();
      this.snack.open('Please fill all required fields and add an image.', 'ok', { duration: 1600 });
      return;
    }

    const { title, body } = this.f.value as { title: string; body: string };
    this.loading = true;

    const fd = new FormData();
    fd.append('Title', title);
    fd.append('Text', body);
    // keep using 'Files' key for compatibility with your backend; just one file
    if (this.selectedFile) {
      fd.append('Files', this.selectedFile, this.selectedFile.name);
    }

    // try admin endpoint first; on 401/403, fallback to user endpoint
    this.admin.createQuestionForm(fd).subscribe({
      next: () => this.onSuccess(true),
      error: (err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 403) {
          this.qs.createQuestion({ title, body }, this.selectedFile ? [this.selectedFile] : []).subscribe({
            next: () => this.onSuccess(false),
            error: e2 => this.onError(e2)
          });
        } else {
          this.onError(err);
        }
      }
    });
  }

  private onSuccess(wasAdmin: boolean) {
    this.loading = false;
    this.snack.open(
      wasAdmin ? 'Question posted (approved)' : 'Question posted (pending review)',
      'ok',
      { duration: 1500 }
    );
    this.router.navigate(['/questions']);
  }

  private onError(err: any) {
    this.loading = false;
    console.error(err);
    this.snack.open('Failed to post question', 'ok', { duration: 2000 });
  }
}
