import {
  HttpClient,
} from '@angular/common/http';

import {
  Injectable,
  inject,
} from '@angular/core';

import {
  Observable,
} from 'rxjs';

import {
  environment,
} from '../../environments/environment';

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
    `${environment.apiBaseUrl}/Users`;

  getUsers():
    Observable<ApiUser[]> {
    return this.http.get<ApiUser[]>(
      this.apiUrl,
    );
  }

  getUserById(
    userId: number,
  ): Observable<ApiUser> {
    return this.http.get<ApiUser>(
      `${this.apiUrl}/${userId}`,
    );
  }

  createUser(
    user: ApiUser,
  ): Observable<ApiUser> {
    return this.http.post<ApiUser>(
      this.apiUrl,
      user,
    );
  }

  updateUser(
    userId: number,
    user: Partial<ApiUser>,
  ): Observable<ApiUser> {
    return this.http.put<ApiUser>(
      this.apiUrl,
      {
        ...user,
        Id:
          user.Id ??
          userId,
      },
    );
  }

  deleteUser(
    userId: number,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${userId}`,
    );
  }
}