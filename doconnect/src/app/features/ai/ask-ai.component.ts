import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AiService } from './ai.service';

@Component({
  standalone: true,
  selector: 'app-ask-ai',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ask-ai.component.html',
  styleUrls: ['./ask-ai.component.scss']
})
export class AskAiComponent {
  private fb = inject(FormBuilder);
  private ai = inject(AiService);

  loading = signal(false);
  answer = signal<string | null>(null);
  error = signal<string | null>(null);
  model = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(2000)]],
    context: ['']
  });

  async submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null); this.answer.set(null); this.model.set(null);

    const { question, context } = this.form.getRawValue();
    this.ai.ask(question, context || undefined).subscribe({
      next: (res) => { this.answer.set(res.answer); this.model.set(res.model); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message || 'AI request failed'); this.loading.set(false); }
    });
  }
}
