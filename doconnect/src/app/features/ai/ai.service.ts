import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AskAiResponse {
  answer: string;
  model: string;
  id?: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/ai`;

  ask(question: string, context?: string) {
    return this.http.post<AskAiResponse>(`${this.base}/ask`, { question, context });
  }
}
