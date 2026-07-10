import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { RolesEnum } from '../../core/enums/app-enums';
import { ApiUser } from '../../models/api-user.model';
import { UsersService } from '../../services/users.service';

type PermissionMode = 'role' | 'custom' | 'overrides';

interface RoleOption {
  id: RolesEnum;
  name: string;
}

interface BranchOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-edit-user',
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
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.scss',
})
export class EditUser implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly snackBar = inject(MatSnackBar);

  private readonly usersService = inject(UsersService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');

  userId = 0;

  private loadedUser: ApiUser | null = null;

  readonly roles: RoleOption[] = [
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
    {
      id: RolesEnum.Custom,
      name: 'Custom',
    },
  ];



  readonly editUserForm = this.formBuilder.group({
    fullName: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.minLength(2),
    ]),

    email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email]),

    phone: this.formBuilder.nonNullable.control(''),

    branch: this.formBuilder.nonNullable.control('', Validators.required),

    roleId: this.formBuilder.control<RolesEnum | null>(null, Validators.required),

    isActive: this.formBuilder.nonNullable.control(true),

    permissionMode: this.formBuilder.nonNullable.control<PermissionMode>('overrides'),
  });

  ngOnInit(): void {
    const routeId = this.activatedRoute.snapshot.paramMap.get('id');

    const id = Number(routeId);

    if (!routeId || !Number.isFinite(id) || id <= 0) {
      this.errorMessage.set('Invalid user ID.');

      return;
    }

    this.userId = id;
    this.loadUser();
  }

  loadUser(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.usersService.getUserById(this.userId).subscribe({
      next: (user: ApiUser) => {
        this.loadedUser = user;

        this.editUserForm.patchValue({
          fullName: user.FullName?.trim() || user.UserName?.trim() || '',

          email: user.Email?.trim() || '',

          phone: user.Phone?.trim() || user.Mobile?.trim() || '',

          branch: 'Downtown',

          roleId: this.normalizeRoleId(user.RoleId),

          isActive: user.Active === 1,

          permissionMode: 'overrides',
        });

        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('Failed to load user:', error);

        this.isLoading.set(false);
        this.setLoadError(error);
      },
    });
  }

  saveChanges(): void {
    if (this.editUserForm.invalid) {
      this.editUserForm.markAllAsTouched();

      this.snackBar.open('Please complete all required fields.', 'Close', {
        duration: 3500,
      });

      return;
    }

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

    this.isSaving.set(true);
    this.errorMessage.set('');

    const formValue = this.editUserForm.getRawValue();

    const request: Partial<ApiUser> = {
      // ...this.loadedUser,

      Id: this.userId,
      UsId: this.loadedUser.UsId,

      UserName: this.loadedUser.UserName,

      FullName: formValue.fullName.trim(),

      Email: formValue.email.trim(),
      Password: this.loadedUser.Password,

      Phone: formValue.phone.trim(),

      Mobile: this.loadedUser.Mobile || '',

      Address: this.loadedUser.Address || '',

      RoleId: formValue.roleId!,

      Active: formValue.isActive ? 1 : 0,
    };

    this.usersService.updateUser(this.userId, request).subscribe({
      next: () => {
        this.isSaving.set(false);

        this.snackBar.open('User updated successfully.', 'Close', {
          duration: 3000,
        });

        this.router.navigate(['/users']);
      },

      error: (error) => {
        console.error('Failed to update user:', error);

        this.isSaving.set(false);
        this.setSaveError(error);
      },
    });
  }

  resetPassword(): void {
    this.snackBar.open('Reset password API is not connected yet.', 'Close', {
      duration: 3000,
    });
  }

  backToUsers(): void {
    this.router.navigate(['/users']);
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }

  private normalizeRoleId(roleId: number): RolesEnum {
    switch (roleId) {
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

  private setLoadError(error: { status?: number }): void {
    if (error.status === 0) {
      this.errorMessage.set(
        'Cannot connect to the server. Check the API URL, network connection, and CORS configuration.',
      );
    } else if (error.status === 401) {
      this.errorMessage.set('Your session has expired. Please log in again.');
    } else if (error.status === 403) {
      this.errorMessage.set('You do not have permission to view this user.');
    } else if (error.status === 404) {
      this.errorMessage.set('The selected user was not found.');
    } else {
      this.errorMessage.set('Unable to load the user. Please try again.');
    }
  }

  private setSaveError(error: {
    status?: number;
    error?: {
      message?: string;
    };
  }): void {
    let message = 'Unable to update the user. Please try again.';

    if (error.status === 0) {
      message = 'Cannot connect to the server.';
    } else if (error.status === 400) {
      message = error.error?.message || 'The submitted user information is invalid.';
    } else if (error.status === 401) {
      message = 'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      message = 'You do not have permission to update users.';
    } else if (error.status === 404) {
      message = 'The selected user was not found.';
    }

    this.errorMessage.set(message);

    this.snackBar.open(message, 'Close', {
      duration: 4000,
    });
  }

  get fullNameControl() {
    return this.editUserForm.controls.fullName;
  }

  get emailControl() {
    return this.editUserForm.controls.email;
  }

  get branchControl() {
    return this.editUserForm.controls.branch;
  }

  get roleControl() {
    return this.editUserForm.controls.roleId;
  }
}
