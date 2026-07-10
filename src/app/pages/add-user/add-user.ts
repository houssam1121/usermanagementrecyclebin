import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  signal,
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import { Router } from '@angular/router';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import {
  RolesEnum,
} from '../../core/enums/app-enums';

import {
  ApiUser,
} from '../../models/api-user.model';

import {
  UsersService,
} from '../../services/users.service';

interface RoleOption {
  id: RolesEnum;
  name: string;
}

interface BranchOption {
  id: number;
  name: string;
}

type PermissionMode =
  | 'role'
  | 'custom'
  | 'overrides';

function passwordMatchValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const password =
    control.get('password')?.value;

  const confirmPassword =
    control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword
    ? null
    : {
        passwordMismatch: true,
      };
}

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './add-user.html',
  styleUrl: './add-user.scss',
})
export class AddUser {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly router =
    inject(Router);

  private readonly usersService =
    inject(UsersService);

  readonly isSaving = signal(false);

  readonly errorMessage = signal('');

  readonly hidePassword = signal(true);

  readonly hideConfirmPassword =
    signal(true);

  readonly roles: RoleOption[] = [
    {
      id: RolesEnum.Custom,
      name: 'Custom',
    },
    {
      id: RolesEnum.Administrator,
      name: 'Administrator',
    },
    {
      id: RolesEnum.Manager,
      name: 'Manager',
    },
    {
      id: RolesEnum.Staff,
      name: 'Staff',
    },
    {
      id: RolesEnum.Waiter,
      name: 'Waiter',
    },
    {
      id: RolesEnum.DeliveryMan,
      name: 'Delivery Man',
    },
  ];

  readonly branches: BranchOption[] = [
    {
      id: 1,
      name: 'Main Branch',
    },
    {
      id: 2,
      name: 'Beirut Branch',
    },
    {
      id: 3,
      name: 'Tripoli Branch',
    },
  ];

  readonly addUserForm =
    this.formBuilder.group(
      {
        fullName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
          ],
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.email,
          ],
        ],

        phone: [''],

        branchId: [
          null as number | null,
          Validators.required,
        ],

        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
          ],
        ],

        confirmPassword: [
          '',
          Validators.required,
        ],

        roleId: [
          null as RolesEnum | null,
          Validators.required,
        ],

        isActive: [true],

        permissionMode: [
          'role' as PermissionMode,
          Validators.required,
        ],
      },
      {
        validators: passwordMatchValidator,
      },
    );

  get fullNameControl() {
    return this.addUserForm.controls.fullName;
  }

  get emailControl() {
    return this.addUserForm.controls.email;
  }

  get phoneControl() {
    return this.addUserForm.controls.phone;
  }

  get branchControl() {
    return this.addUserForm.controls.branchId;
  }

  get passwordControl() {
    return this.addUserForm.controls.password;
  }

  get confirmPasswordControl() {
    return this.addUserForm.controls
      .confirmPassword;
  }

  get roleControl() {
    return this.addUserForm.controls.roleId;
  }

  get permissionModeControl() {
    return this.addUserForm.controls
      .permissionMode;
  }

  backToUsers(): void {
    this.router.navigate(['/users']);
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(
      (currentValue) => !currentValue,
    );
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update(
      (currentValue) => !currentValue,
    );
  }

  createUser(): void {
    if (this.isSaving()) {
      return;
    }

    this.errorMessage.set('');

    if (this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched();
      return;
    }

    const formValue =
      this.addUserForm.getRawValue();

    const fullName =
      formValue.fullName?.trim() ?? '';

    const email =
      formValue.email?.trim() ?? '';

    const phone =
      formValue.phone?.trim() ?? '';

    const password =
      formValue.password ?? '';

    const roleId =
      formValue.roleId;

    if (roleId === null) {
      this.roleControl.markAsTouched();
      return;
    }

    const requestBody: ApiUser = {
      Id: 0,

      UsId: 0,

      UserName:
        this.generateUserName(email),

      FullName: fullName,

      Email: email,

      Phone:
        phone.length > 0
          ? phone
          : null,

      Mobile: null,

      Address: null,

      Password: password,

      RoleId: roleId,

      Active:
        formValue.isActive === true
          ? 1
          : 0,

      CreatedAt:
        new Date().toISOString(),

      SuspendedDate: null,
    };

    console.log(
      'Create user request body:',
      requestBody,
    );

    this.isSaving.set(true);

    this.usersService
      .createUser(requestBody)
      .subscribe({
        next: (createdUser) => {
          console.log(
            'User created successfully:',
            createdUser,
          );

          this.isSaving.set(false);

          this.router.navigate(['/users']);
        },

        error: (
          error: HttpErrorResponse,
        ) => {
          console.error(
            'Failed to create user:',
            error,
          );

          this.isSaving.set(false);

          this.setErrorMessage(error);
        },
      });
  }

  private generateUserName(
    email: string,
  ): string {
    const emailUserName =
      email
        .split('@')[0]
        ?.trim()
        .toLowerCase();

    if (emailUserName) {
      return emailUserName;
    }

    return `user_${Date.now()}`;
  }

  private setErrorMessage(
    error: HttpErrorResponse,
  ): void {
    if (error.status === 0) {
      this.errorMessage.set(
        'Cannot connect to the server. Check the API URL and network connection.',
      );

      return;
    }

    if (error.status === 400) {
      this.errorMessage.set(
        this.extractApiError(
          error,
          'The entered user information is invalid.',
        ),
      );

      return;
    }

    if (error.status === 401) {
      this.errorMessage.set(
        'Your session has expired. Please log in again.',
      );

      return;
    }

    if (error.status === 403) {
      this.errorMessage.set(
        'You do not have permission to create users.',
      );

      return;
    }

    if (error.status === 409) {
      this.errorMessage.set(
        'A user with this email or username already exists.',
      );

      return;
    }

    if (error.status >= 500) {
      this.errorMessage.set(
        'A server error occurred while creating the user.',
      );

      return;
    }

    this.errorMessage.set(
      this.extractApiError(
        error,
        'Failed to create the user. Please try again.',
      ),
    );
  }

  private extractApiError(
    error: HttpErrorResponse,
    fallbackMessage: string,
  ): string {
    const apiError =
      error.error;

    if (typeof apiError === 'string') {
      return apiError;
    }

    if (
      apiError &&
      typeof apiError.message === 'string'
    ) {
      return apiError.message;
    }

    if (
      apiError &&
      typeof apiError.title === 'string'
    ) {
      return apiError.title;
    }

    if (
      apiError?.errors &&
      typeof apiError.errors === 'object'
    ) {
      const validationMessages =
        Object.values(apiError.errors)
          .flat()
          .filter(
            (
              message,
            ): message is string =>
              typeof message === 'string',
          );

      if (validationMessages.length > 0) {
        return validationMessages.join(' ');
      }
    }

    return fallbackMessage;
  }
}