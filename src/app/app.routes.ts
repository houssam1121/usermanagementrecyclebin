import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    loadComponent: () =>
      import(
        './pages/user-management/user-management'
      ).then(
        (component) =>
          component.UserManagement,
      ),
  },
  {
    path: 'users/add',
    loadComponent: () =>
      import(
        './pages/add-user/add-user'
      ).then(
        (component) =>
          component.AddUser,
      ),
  },
  {
    path: 'users/:id/edit',
    loadComponent: () =>
      import(
        './pages/edit-user/edit-user'
      ).then(
        (component) =>
          component.EditUser,
      ),
  },
  {
    path: '**',
    redirectTo: 'users',
  },
];