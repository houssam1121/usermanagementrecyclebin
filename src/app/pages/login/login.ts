import {
  Component,
  OnInit,
  inject,
} from '@angular/core';

import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  finalize,
} from 'rxjs';

import {
  MatButtonModule,
} from '@angular/material/button';

import {
  MatCheckboxModule,
} from '@angular/material/checkbox';

import {
  MatFormFieldModule,
} from '@angular/material/form-field';

import {
  MatIconModule,
} from '@angular/material/icon';

import {
  MatInputModule,
} from '@angular/material/input';

import {
  MatProgressSpinnerModule,
} from '@angular/material/progress-spinner';

import {
  ApiError,
} from '../../models/api-error.model';

import {
  LoginRequest,
} from '../../models/auth.models';

import {
  AuthService,
} from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private readonly formBuilder =
    inject(NonNullableFormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  private readonly activatedRoute =
    inject(ActivatedRoute);

  readonly loginForm =
    this.formBuilder.group({
      userName: [
        '',
        [
          Validators.required,
        ],
      ],

      password: [
        '',
        [
          Validators.required,
        ],
      ],

      rememberMe: [true],
    });

  isLoading = false;
  hidePassword = true;
  errorMessage = '';

  ngOnInit(): void {
    if (
      this.authService.isAuthenticated()
    ) {
      void this.router.navigateByUrl(
        '/users',
      );
    }
  }

  login(): void {
    this.errorMessage = '';

    if (
      this.loginForm.invalid ||
      this.isLoading
    ) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const formValue =
      this.loginForm.getRawValue();

    const loginRequest: LoginRequest = {
      UserName:
        formValue.userName.trim(),

      Password:
        formValue.password,
    };

    this.isLoading = true;

    this.authService
      .login(loginRequest)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: () => {
          const returnUrl =
            this.getSafeReturnUrl();

          void this.router.navigateByUrl(
            returnUrl,
          );
        },

        error: (error: ApiError) => {
          console.error(
            'Login failed:',
            error.originalError,
          );

          this.errorMessage =
            error.message ||
            'Login failed. Please try again.';
        },
      });
  }

  togglePasswordVisibility(): void {
    this.hidePassword =
      !this.hidePassword;
  }

  private getSafeReturnUrl(): string {
    const returnUrl =
      this.activatedRoute.snapshot
        .queryParamMap
        .get('returnUrl');

    if (
      returnUrl &&
      returnUrl.startsWith('/') &&
      !returnUrl.startsWith('//') &&
      returnUrl !== '/login'
    ) {
      return returnUrl;
    }

    return '/users';
  }
}