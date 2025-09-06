import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type RoleType = 'User' | 'Admin';

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  role: RoleType;
  createdAt?: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  role: RoleType;
}

export interface UpdateUserPayload {
  username: string;
  email: string;
  role: RoleType;
  newPassword?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/users`;

  list(search?: string) {
    const params: any = {};
    if (search) params.search = search;
    return this.http.get<UserSummary[]>(this.base, { params });
  }
  get(id: string) {
    return this.http.get<UserSummary>(`${this.base}/${id}`);
  }
  create(payload: CreateUserPayload) {
    return this.http.post<UserSummary>(this.base, payload);
  }
  update(id: string, payload: UpdateUserPayload) {
    return this.http.put<void>(`${this.base}/${id}`, payload);
  }
  delete(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
