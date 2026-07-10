export interface ApiUser {
  Id: number;
  UsId: number;
  UserName: string;
  FullName: string;
  Email: string | null;
  Phone: string | null;
  Mobile: string | null;
  Address: string | null;
  Password: string;
  RoleId: number;
  Active: number;
  CreatedAt: string;
  SuspendedDate: string | null;
}