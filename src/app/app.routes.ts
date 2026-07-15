import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import(
        './pages/login/login'
      ).then(
        (component) =>
          component.Login,
      ),
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './shell'
      ).then(
        (component) =>
          component.shell,
      ),
    children: [
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
            './pages/user-form/user-form'
          ).then(
            (component) =>
              component.UserForm,
          ),
      },

   
      {
        path: 'users/:id/edit',
        loadComponent: () =>
          import(
            './pages/user-form/user-form'
          ).then(
            (component) =>
              component.UserForm,
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'users',
  },
];