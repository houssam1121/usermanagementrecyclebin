export interface LoginRequest {
  UserName: string;
  Password: string;
}

export interface AuthRole {
  RoleId: number;
  EnumRole: number;
  RoleTitle: string;
  Description: string;
  LastUpdatedAt: string | null;
  NbOfUsersAssigned: number;
}

export interface AuthPermission {
  AppSectionPermissionId: number;
  EnumSectionKey: number;
  EnumPermissionKey: number;
  PermissionTitle: string;
  Description: string;
  IsSectionVisibilityPermission: boolean;
  Granted: boolean;
  Predefined: boolean;
  Override: boolean;
}

export interface LoginResponse {
  AccessToken: string;
  RefreshToken: string;
  ExpiresIn: string;
  LastLoginAt: string | null;

  Role: AuthRole | null;
  RolePermissions: AuthPermission[];

  POS: unknown | null;

  Id: number;
  UsId: number;
  UserName: string;
  FullName: string;
  Email: string;
  Phone: string;
  Mobile: string;
  Address: string;
  Password?: string;
  RoleId: number;
  Active: number;
  CreatedAt: string;
  SuspendedDate: string | null;
}

export interface StoredAuthUser {
  Id: number;
  UsId: number;
  UserName: string;
  FullName: string;
  Email: string;
  Phone: string;
  Mobile: string;
  Address: string;
  RoleId: number;
  Active: number;
  CreatedAt: string;
  SuspendedDate: string | null;
  LastLoginAt: string | null;
  Role: AuthRole | null;
  RolePermissions: AuthPermission[];
}