import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
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
  ActivatedRoute,
  Router,
} from '@angular/router';

import { finalize } from 'rxjs';

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
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';

import {
  RolesEnum,
} from '../../core/enums/app-enums';

import {
  ApiError,
} from '../../models/api-error.model';

import {
  ApiUser,
} from '../../models/api-user.model';

import {
  UsersService,
} from '../../services/users.service';

type PermissionMode =
  | 'role'
  | 'custom'
  | 'overrides';

interface RoleOption {
  id: RolesEnum;
  name: string;
}

interface BranchOption {
  id: number;
  name: string;
}

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
  selector: 'app-user-form',
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
    MatSnackBarModule,
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
})
export class UserForm implements OnInit {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly activatedRoute =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly snackBar =
    inject(MatSnackBar);

  private readonly usersService =
    inject(UsersService);

  readonly isEditMode =
    signal(false);

  readonly isLoading =
    signal(false);

  readonly isSaving =
    signal(false);

  readonly loadErrorMessage =
    signal('');

  readonly errorMessage =
    signal('');

  readonly hidePassword =
    signal(true);

  readonly hideConfirmPassword =
    signal(true);

  userId = 0;

  private loadedUser:
    ApiUser | null = null;

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

  readonly userForm =
    this.formBuilder.group(
      {
        fullName:
          this.formBuilder.nonNullable.control(
            '',
            [
              Validators.required,
              Validators.minLength(2),
            ],
          ),

        email:
          this.formBuilder.nonNullable.control(
            '',
            [
              Validators.required,
              Validators.email,
            ],
          ),

        phone:
          this.formBuilder.nonNullable.control(
            '',
          ),

        branchId:
          this.formBuilder.control<
            number | null
          >(
            null,
            Validators.required,
          ),

        password:
          this.formBuilder.nonNullable.control(
            '',
            [
              Validators.required,
              Validators.minLength(6),
            ],
          ),

        confirmPassword:
          this.formBuilder.nonNullable.control(
            '',
            Validators.required,
          ),

        roleId:
          this.formBuilder.control<
            RolesEnum | null
          >(
            null,
            Validators.required,
          ),

        isActive:
          this.formBuilder.nonNullable.control(
            true,
          ),

        permissionMode:
          this.formBuilder.nonNullable.control<
            PermissionMode
          >(
            'role',
            Validators.required,
          ),
      },
      {
        validators:
          passwordMatchValidator,
      },
    );

  ngOnInit(): void {
    const routeId =
      this.activatedRoute.snapshot
        .paramMap
        .get('id');

    if (!routeId) {
      this.setupAddMode();
      return;
    }

    const parsedId =
      Number(routeId);

    if (
      !Number.isInteger(parsedId) ||
      parsedId <= 0
    ) {
      this.isEditMode.set(true);

      this.loadErrorMessage.set(
        'Invalid user ID.',
      );

      return;
    }

    this.userId = parsedId;

    this.setupEditMode();

    this.loadUser();
  }

  private setupAddMode(): void {
    this.isEditMode.set(false);

    this.passwordControl.setValidators([
      Validators.required,
      Validators.minLength(6),
    ]);

    this.confirmPasswordControl.setValidators([
      Validators.required,
    ]);

    this.passwordControl
      .updateValueAndValidity({
        emitEvent: false,
      });

    this.confirmPasswordControl
      .updateValueAndValidity({
        emitEvent: false,
      });
  }

  private setupEditMode(): void {
    this.isEditMode.set(true);

    /*
     * Password is not edited using this form.
     * Reset Password remains a separate action.
     */
    this.passwordControl.clearValidators();

    this.confirmPasswordControl
      .clearValidators();

    this.passwordControl.setValue('');

    this.confirmPasswordControl.setValue('');

    this.passwordControl
      .updateValueAndValidity({
        emitEvent: false,
      });

    this.confirmPasswordControl
      .updateValueAndValidity({
        emitEvent: false,
      });

    this.userForm.controls.permissionMode
      .setValue('overrides');
  }

  get pageTitle(): string {
    return this.isEditMode()
      ? 'Edit User'
      : 'Add New User';
  }

  get pageDescription(): string {
    return this.isEditMode()
      ? 'Update user information and permissions'
      : 'Create a new user account';
  }

  get submitButtonText(): string {
    return this.isEditMode()
      ? 'Save Changes'
      : 'Create User';
  }

  get savingButtonText(): string {
    return this.isEditMode()
      ? 'Saving...'
      : 'Creating...';
  }

  loadUser(): void {
    if (
      !this.isEditMode() ||
      this.userId <= 0 ||
      this.isLoading()
    ) {
      return;
    }

    this.isLoading.set(true);

    this.loadErrorMessage.set('');

    this.usersService
      .getUserById(this.userId)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (user: ApiUser) => {
          this.loadedUser = user;

          this.userForm.patchValue({
            fullName:
              user.FullName?.trim() ||
              user.UserName?.trim() ||
              '',

            email:
              user.Email?.trim() ||
              '',

            phone:
              user.Phone?.trim() ||
              user.Mobile?.trim() ||
              '',

            /*
             * ApiUser currently has no BranchId.
             * Replace this value when BranchId is
             * added to your API model.
             */
            branchId: 1,

            roleId:
              this.normalizeRoleId(
                user.RoleId,
              ),

            isActive:
              user.Active === 1,

            permissionMode:
              'overrides',
          });

          this.userForm.markAsPristine();
        },

        error: (error: ApiError) => {
          console.error(
            'Failed to load user:',
            error,
          );

          this.loadErrorMessage.set(
            error.message ||
              'Unable to load user information.',
          );
        },
      });
  }

  submit(): void {
    if (
      this.isSaving() ||
      this.isLoading()
    ) {
      return;
    }

    this.errorMessage.set('');

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();

      this.snackBar.open(
        'Please complete all required fields.',
        'Close',
        {
          duration: 3500,
        },
      );

      return;
    }

    if (this.isEditMode()) {
      this.updateUser();
      return;
    }

    this.createUser();
  }

  private createUser(): void {
    const formValue =
      this.userForm.getRawValue();

    if (formValue.roleId === null) {
      this.roleControl.markAsTouched();
      return;
    }

    const email =
      formValue.email.trim();

    const phone =
      formValue.phone.trim();

    const requestBody: ApiUser = {
      Id: 0,

      UsId: 0,

      UserName:
        this.generateUserName(email),

      FullName:
        formValue.fullName.trim(),

      Email:
        email,

      Phone:
        phone || null,

      Mobile:
        null,

      Address:
        null,

      Password:
        formValue.password,

      RoleId:
        formValue.roleId,

      Active:
        formValue.isActive
          ? 1
          : 0,

      CreatedAt:
        new Date().toISOString(),

      SuspendedDate:
        null,
    };

    this.isSaving.set(true);

    this.usersService
      .createUser(requestBody)
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.snackBar.open(
            'User created successfully.',
            'Close',
            {
              duration: 3000,
            },
          );

          this.router.navigate([
            '/users',
          ]);
        },

        error: (error: ApiError) => {
          console.error(
            'Failed to create user:',
            error,
          );

          this.errorMessage.set(
            error.message ||
              'Unable to create user.',
          );

          this.snackBar.open(
            error.message ||
              'Unable to create user.',
            'Close',
            {
              duration: 4000,
            },
          );
        },
      });
  }

  private updateUser(): void {
    if (!this.loadedUser) {
      this.snackBar.open(
        'User information is unavailable. Reload the page and try again.',
        'Close',
        {
          duration: 3500,
        },
      );

      return;
    }

    const formValue =
      this.userForm.getRawValue();

    if (formValue.roleId === null) {
      this.roleControl.markAsTouched();
      return;
    }

    const requestBody:
      Partial<ApiUser> = {
        Id:
          this.userId,

        UsId:
          this.loadedUser.UsId,

        UserName:
          this.loadedUser.UserName,

        FullName:
          formValue.fullName.trim(),

        Email:
          formValue.email.trim(),

        Password:
          this.loadedUser.Password,

        Phone:
          formValue.phone.trim() ||
          null,

        Mobile:
          this.loadedUser.Mobile ||
          null,

        Address:
          this.loadedUser.Address ||
          null,

        RoleId:
          formValue.roleId,

        Active:
          formValue.isActive
            ? 1
            : 0,

        CreatedAt:
          this.loadedUser.CreatedAt,

        SuspendedDate:
          this.loadedUser.SuspendedDate,
      };

    this.isSaving.set(true);

    this.usersService
      .updateUser(
        this.userId,
        requestBody,
      )
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.snackBar.open(
            'User updated successfully.',
            'Close',
            {
              duration: 3000,
            },
          );

          this.router.navigate([
            '/users',
          ]);
        },

        error: (error: ApiError) => {
          console.error(
            'Failed to update user:',
            error,
          );

          this.errorMessage.set(
            error.message ||
              'Unable to update user.',
          );

          this.snackBar.open(
            error.message ||
              'Unable to update user.',
            'Close',
            {
              duration: 4000,
            },
          );
        },
      });
  }

  resetPassword(): void {
    this.snackBar.open(
      'Reset password API is not connected yet.',
      'Close',
      {
        duration: 3000,
      },
    );
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(
      (currentValue) =>
        !currentValue,
    );
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update(
      (currentValue) =>
        !currentValue,
    );
  }

  backToUsers(): void {
    this.router.navigate([
      '/users',
    ]);
  }

  cancel(): void {
    this.router.navigate([
      '/users',
    ]);
  }

  private normalizeRoleId(
    roleId:
      | number
      | null
      | undefined,
  ): RolesEnum {
    switch (Number(roleId)) {
      case RolesEnum.Administrator:
        return RolesEnum.Administrator;

      case RolesEnum.Manager:
        return RolesEnum.Manager;

      case RolesEnum.Staff:
        return RolesEnum.Staff;

      case RolesEnum.Waiter:
        return RolesEnum.Waiter;

      case RolesEnum.DeliveryMan:
        return RolesEnum.DeliveryMan;

      case RolesEnum.Custom:
      default:
        return RolesEnum.Custom;
    }
  }

  private generateUserName(
    email: string,
  ): string {
    const emailUserName =
      email
        .split('@')[0]
        ?.trim()
        .toLowerCase();

    return emailUserName ||
      `user_${Date.now()}`;
  }

  get fullNameControl() {
    return this.userForm.controls
      .fullName;
  }

  get emailControl() {
    return this.userForm.controls
      .email;
  }

  get phoneControl() {
    return this.userForm.controls
      .phone;
  }

  get branchControl() {
    return this.userForm.controls
      .branchId;
  }

  get passwordControl() {
    return this.userForm.controls
      .password;
  }

  get confirmPasswordControl() {
    return this.userForm.controls
      .confirmPassword;
  }

  get roleControl() {
    return this.userForm.controls
      .roleId;
  }

  get permissionModeControl() {
    return this.userForm.controls
      .permissionMode;
  }
}