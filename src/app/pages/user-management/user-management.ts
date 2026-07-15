
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { RolesEnum } from '../../core/enums/app-enums';

import { ApiUser } from '../../models/api-user.model';
import { UsersService } from '../../services/users.service';

import {
  ConfirmDeleteDialog,
  ConfirmDeleteDialogData,
} from '../../shared/components/confirm-delete-dialog/confirm-delete-dialog';
import { ApiError } from '../../models/api-error.model';

type UserStatus =
  | 'Active'
  | 'Inactive';

interface RoleOption {
  id: RolesEnum;
  label: string;
}

interface User {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  roleId: RolesEnum;
  role: string;
  status: UserStatus;
  branch: string;
  lastLogin: string;
  createdAt: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement implements OnInit {
  private readonly usersService =
    inject(UsersService);

  private readonly router =
    inject(Router);

  private readonly dialog =
    inject(MatDialog);

  readonly displayedColumns: string[] = [
    'user',
    'role',
    'status',
    'actions',
  ];

  readonly roles: RoleOption[] =
    this.createRoleOptions();

  searchText = '';

  selectedStatus = '';

  selectedRole:
    RolesEnum | '' = '';

  readonly users =
    signal<User[]>([]);

  readonly isLoading =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly deletingUserId =
    signal<number | null>(null);

  readonly updatingUserId =
    signal<number | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.usersService
      .getUsers()
      .subscribe({
        next: (
          apiUsers: ApiUser[],
        ) => {
          const mappedUsers =
            apiUsers.map(
              (apiUser) =>
                this.mapApiUser(
                  apiUser,
                ),
            );

          this.users.set(
            mappedUsers,
          );

          this.isLoading.set(
            false,
          );
        },

        error: (
          error: ApiError,
        ) => {
          console.error(
            'Failed to load users:',
            error,
          );

          this.isLoading.set(
            false,
          );

          this.errorMessage.set(
            error.message,
          );
        },
      });
  }

  private mapApiUser(
    apiUser: ApiUser,
  ): User { 
    const roleId =
      this.normalizeRoleId(
        apiUser.RoleId,
      );

    return {
      id:
        apiUser.Id,

      userName:
        apiUser.UserName?.trim() ||
        '',

      fullName:
        apiUser.FullName?.trim() ||
        apiUser.UserName?.trim() ||
        'Unknown User',

      email:
        apiUser.Email?.trim() ||
        'No email',

      phone:
        apiUser.Phone?.trim() ||
        '',

      mobile:
        apiUser.Mobile?.trim() ||
        '',

      address:
        apiUser.Address?.trim() ||
        '',

      roleId,

      role:
        this.getRoleLabel(
          roleId,
        ),

      status:
        apiUser.Active === 1
          ? 'Active'
          : 'Inactive',

      branch:
        '—',

      lastLogin:
        '—',

      createdAt:
        apiUser.CreatedAt ||
        '',
    };
  }

  private createRoleOptions():
    RoleOption[] {
    return Object.values(
      RolesEnum,
    )
      .filter(
        (
          value,
        ): value is RolesEnum =>
          typeof value ===
          'number',
      )
      .map((id) => ({
        id,
        label:
          this.getRoleLabel(
            id,
          ),
      }));
  }

  private normalizeRoleId(
    roleId:
      | number
      | null
      | undefined,
  ): RolesEnum {
    const roleValue =
      Number(roleId);

    const roleExists =
      this.roles.some(
        (role) =>
          role.id ===
          roleValue,
      );

    return roleExists
      ? roleValue
      : RolesEnum.Custom;
  }

  getRoleLabel(
    roleId: RolesEnum,
  ): string {
    const enumName =
      RolesEnum[roleId];

    if (!enumName) {
      return 'Custom';
    }

    return enumName.replace(
      /([a-z])([A-Z])/g,
      '$1 $2',
    );
  }

  get filteredUsers():
    User[] {
    const search =
      this.searchText
        .trim()
        .toLowerCase();

    return this.users().filter(
      (user) => {
        const matchesSearch =
          !search ||
          user.fullName
            .toLowerCase()
            .includes(search) ||
          user.userName
            .toLowerCase()
            .includes(search) ||
          user.email
            .toLowerCase()
            .includes(search) ||
          user.mobile
            .toLowerCase()
            .includes(search) ||
          user.phone
            .toLowerCase()
            .includes(search);

        const matchesStatus =
          !this.selectedStatus ||
          user.status
            .toLowerCase() ===
            this.selectedStatus
              .toLowerCase();

        const matchesRole =
          this.selectedRole ===
            '' ||
          user.roleId ===
            this.selectedRole;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesRole
        );
      },
    );
  }

  getUserInitials(
    fullName: string,
  ): string {
    if (!fullName.trim()) {
      return '?';
    }

    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(
        (name) =>
          name
            .charAt(0)
            .toUpperCase(),
      )
      .join('');
  }

  getRoleClass(
    roleId: RolesEnum,
  ): string {
    switch (roleId) {
      case RolesEnum.Administrator:
        return 'role-admin';

      case RolesEnum.Manager:
        return 'role-manager';

      case RolesEnum.Staff:
        return 'role-staff';

      case RolesEnum.Waiter:
        return 'role-waiter';

      case RolesEnum.DeliveryMan:
        return 'role-delivery';

      case RolesEnum.Custom:
        return 'role-custom';

      default:
        return 'role-default';
    }
  }

  getStatusClass(
    status: UserStatus,
  ): string {
    return status === 'Active'
      ? 'status-active'
      : 'status-inactive';
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.selectedRole = '';
  }

  addUser(): void {
    this.router.navigate([
      '/users/add',
    ]);
  }

  viewUser(
    user: User,
  ): void {
    this.router.navigate([
      '/users',
      user.id,
    ]);
  }

  editUser(
    user: User,
  ): void {
    this.router.navigate([
      '/users',
      user.id,
      'edit',
    ]);
  }

  deleteUser(
    user: User,
  ): void {
    if (
      this.deletingUserId() ===
      user.id
    ) {
      return;
    }

    const dialogData:
      ConfirmDeleteDialogData = {
        title:
          'Delete User',

        message:
          `Are you sure you want to delete ${user.fullName}? This action cannot be undone.`,

        cancelText:
          'Cancel',

        confirmText:
          'Delete',
      };

    const dialogRef =
      this.dialog.open<
        ConfirmDeleteDialog,
        ConfirmDeleteDialogData,
        boolean
      >(
        ConfirmDeleteDialog,
        {
          width:
            '430px',

          maxWidth:
            'calc(100vw - 32px)',

          disableClose:
            true,

          autoFocus:
            false,

          data:
            dialogData,
        },
      );

    dialogRef
      .afterClosed()
      .subscribe(
        (confirmed) => {
          if (!confirmed) {
            return;
          }

          this.deletingUserId.set(
            user.id,
          );

          this.errorMessage.set(
            '',
          );

          this.usersService
            .deleteUser(
              user.id,
            )
            .subscribe({
              next: () => {
                this.users.update(
                  (
                    currentUsers,
                  ) =>
                    currentUsers.filter(
                      (
                        currentUser,
                      ) =>
                        currentUser.id !==
                        user.id,
                    ),
                );

                this.deletingUserId.set(
                  null,
                );
              },

              error: (
                error: ApiError,
              ) => {
                console.error(
                  'Failed to delete user:',
                  error,
                );

                this.deletingUserId.set(
                  null,
                );

                this.errorMessage.set(
                  error.message,
                );
              },
            });
        },
      );
  }
}
