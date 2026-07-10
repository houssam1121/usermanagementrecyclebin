import {
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';

import {
  Injectable,
  inject,
} from '@angular/core';

import {
  Observable,
} from 'rxjs';

import {
  ApiUser,
} from '../models/api-user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    'http://192.168.120.120:2011/api/Users';

  private getHeaders(): HttpHeaders {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOiI4IiwiVG9rZW5JRCI6IjIyMjMiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjgiLCJqdGkiOiJmZmYyNWQ1OS1lYmY0LTRhMTktOTc5MS0zYmRhZmVhMjkzNmEiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJ1c2VyLW1hbmFnZW1lbnQiLCJleHAiOjE3ODM2ODYxMzYsImlzcyI6IlJlc3RhdXJhbnRQb3NBcGkiLCJhdWQiOiJSZXN0YXVyYW50UG9zQ2xpZW50In0.qkrTyEr_tPxNwvr3Cm_wtqjH2-tQFQHMfN5rikS74-s';

    return new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * GET: /api/Users
   */
  getUsers(): Observable<ApiUser[]> {
    return this.http.get<ApiUser[]>(
      this.apiUrl,
      {
        headers: this.getHeaders(),
      },
    );
  }

  /**
   * GET: /api/Users/5
   */
  getUserById(
    userId: number,
  ): Observable<ApiUser> {
    return this.http.get<ApiUser>(
      `${this.apiUrl}/${userId}`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  /**
   * POST: /api/Users
   */
  createUser(
    user: ApiUser,
  ): Observable<ApiUser> {
    return this.http.post<ApiUser>(
      this.apiUrl,
      user,
      {
        headers: this.getHeaders(),
      },
    );
  }

  /**
   * PUT: /api/Users
   */
  updateUser(
    userId: number,
    user: Partial<ApiUser>,
  ): Observable<ApiUser> {
    return this.http.put<ApiUser>(
      this.apiUrl,
      user,
      {
        headers: this.getHeaders(),
      },
    );
  }

  /**
   * DELETE: /api/Users/5
   */
  deleteUser(
    userId: number,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${userId}`,
      {
        headers: this.getHeaders(),
      },
    );
  }
}