import {
  Injectable,
  inject,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  Router,
} from '@angular/router';

import {
  BehaviorSubject,
  Observable,
  tap,
} from 'rxjs';

import {
  environment,
} from '../../environments/environment';

import {
  LoginRequest,
  LoginResponse,
  StoredAuthUser,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http =
    inject(HttpClient);

  private readonly router =
    inject(Router);

  private readonly loginUrl =
    `${environment.apiBaseUrl}/Auth/login-user-management`;

  private readonly accessTokenKey =
    'user-management-access-token';

  private readonly refreshTokenKey =
    'user-management-refresh-token';

  private readonly expiresAtKey =
    'user-management-expires-at';

  private readonly currentUserKey =
    'user-management-current-user';

  private readonly currentUserSubject =
    new BehaviorSubject<StoredAuthUser | null>(
      this.readStoredUser(),
    );

  readonly currentUser$ =
    this.currentUserSubject.asObservable();

  login(
    credentials: LoginRequest,
  ): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        this.loginUrl,
        credentials,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )
      .pipe(
        tap((response) => {
          this.saveAuthentication(
            response,
          );
        }),
      );
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(
      this.accessTokenKey,
    );
  }

  getRefreshToken(): string | null {
     return sessionStorage.getItem(
      this.refreshTokenKey,
    );
  }

  getCurrentUser():
    StoredAuthUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const accessToken =
      this.getAccessToken();

    if (!accessToken) {
      return false;
    }

    const expiresAtValue =
      sessionStorage.getItem(
        this.expiresAtKey,
      );

    if (!expiresAtValue) {
      return true;
    }

    const expiresAt =
      Number(expiresAtValue);

    if (
      Number.isNaN(expiresAt) ||
      Date.now() >= expiresAt
    ) {
      this.clearAuthentication();      
      return false;
    }

    return true;
  }

  logout(): void {
    this.clearAuthentication();

    void this.router.navigateByUrl(
      '/login',
    );
  }

  hasRole(
    roleId: number,
  ): boolean {
    return (
      this.getCurrentUser()?.RoleId ===
      roleId
    );
  }

  hasPermission(
    permissionKey: number,
  ): boolean {
    const user =
      this.getCurrentUser();

    if (!user) {
      return false;
    }

    return user.RolePermissions.some(
      (permission) =>
        permission.EnumPermissionKey ===
          permissionKey &&
        permission.Granted,
    );
  }

  private saveAuthentication(
    response: LoginResponse,
  ): void {
    const expiresInSeconds =
      Number(response.ExpiresIn);

    const expiresAt =
      Number.isFinite(
        expiresInSeconds,
      ) &&
      expiresInSeconds > 0
        ? Date.now() +
          expiresInSeconds * 1000
        : null;

    const user: StoredAuthUser = {
      Id: response.Id,
      UsId: response.UsId,
      UserName: response.UserName,
      FullName: response.FullName,
      Email: response.Email,
      Phone: response.Phone,
      Mobile: response.Mobile,
      Address: response.Address,
      RoleId: response.RoleId,
      Active: response.Active,
      CreatedAt: response.CreatedAt,
      SuspendedDate:
        response.SuspendedDate,
      LastLoginAt:
        response.LastLoginAt,
      Role: response.Role,
      RolePermissions:
        response.RolePermissions ?? [],
    };

    sessionStorage.setItem(
      this.accessTokenKey,
      response.AccessToken,
    );

    sessionStorage.setItem(
      this.refreshTokenKey,
      response.RefreshToken,
    );

    sessionStorage.setItem(
      this.currentUserKey,
      JSON.stringify(user),
    );

    if (expiresAt !== null) {
      sessionStorage.setItem(
        this.expiresAtKey,
        expiresAt.toString(),
      );
    }

    this.currentUserSubject.next(
      user,
    );
  }

  private clearAuthentication(): void {
    sessionStorage.removeItem(
      this.accessTokenKey,
    );

    sessionStorage.removeItem(
      this.refreshTokenKey,
    );

    sessionStorage.removeItem(
      this.expiresAtKey,
    );

    sessionStorage.removeItem(
      this.currentUserKey,
    );

    this.currentUserSubject.next(
      null,
    );
  }

  private readStoredUser():
    StoredAuthUser | null {
    const storedUser =
      sessionStorage.getItem(
        this.currentUserKey,
      );

    if (!storedUser) {
      return null;
    }

    try {  
      return JSON.parse(
        storedUser,
      ) as StoredAuthUser;
    } catch {
      sessionStorage.removeItem(
        this.currentUserKey,
      );

      return null;
    }
  } 
}