// src/app/core/question.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { QuestionDto, CreateQuestionDto, AnswerDto } from './models';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private api = `${environment.apiUrl}/Questions`;

  constructor(private http: HttpClient) {}

  getQuestions(search = '', page = 1, pageSize = 20) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.http.get<{ items: QuestionDto[], total: number }>(this.api, { params });
  }

  getQuestion(id: number) { return this.http.get<QuestionDto>(`${this.api}/${id}`); }

  createQuestion(dto: CreateQuestionDto, files?: File[]) {
  const fd = new FormData();
  fd.append('Title', dto.title);   // ✅ backend expects "Title"
  fd.append('Text', dto.body);     // ✅ backend expects "Text"
  if (files) {
    files.forEach(f => fd.append('Files', f, f.name)); // ✅ backend expects "Files"
  }
  return this.http.post<QuestionDto>(this.api, fd);
}


  getAnswers(questionId: number) {
    return this.http.get<AnswerDto[]>(`${environment.apiUrl}/questions/${questionId}/Answers`);
  }

  postAnswer(questionId: number, body: { body: string }) {
    return this.http.post<AnswerDto>(`${environment.apiUrl}/questions/${questionId}/Answers`, body);
  }
}
