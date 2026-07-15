import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';

import {
  inject,
} from '@angular/core';

import {
  catchError,
  throwError,
} from 'rxjs';

import {
  ApiError,
} from '../models/api-error.model';

import {
  AuthService,
} from '../services/auth.service';

export const authInterceptor:
  HttpInterceptorFn = (
    request,
    next,
  ) => {
    const authService =
      inject(AuthService);

    const accessToken =
      authService.getAccessToken();

    const isLoginRequest =
      request.url.includes(
        '/Auth/login-user-management',
      );

    let requestToSend =
      request;

    if (
      accessToken &&
      !isLoginRequest
    ) {
      requestToSend =
        request.clone({
          setHeaders: {
            Authorization:
              `Bearer ${accessToken}`,
            Accept:
              'application/json',
          },
        });
    }

    return next(
      requestToSend,
    ).pipe(
      catchError(
        (
          error:
            HttpErrorResponse,
        ) => {
          const apiError =
            createApiError(
              error,
              isLoginRequest,
            );


          if (
            error.status === 401 &&
            !isLoginRequest
          ) {
            authService.logout();
          }

          return throwError(
            () => apiError,
          );
        },
      ),
    );
  };

function createApiError(
  error: HttpErrorResponse,
  isLoginRequest: boolean,
): ApiError {
  let message =
    extractBackendMessage(error);

  if (error.status === 0) {
    message =
      'Cannot connect to the server. Check the API URL, network connection, and CORS configuration.';
  } else if (
    error.status === 400
  ) {
    message =
      message ||
      'The submitted information is invalid. Please check the entered values.';
  } else if (
    error.status === 401
  ) {
    message =
      isLoginRequest
        ? 'The username or password is incorrect.'
        : 'Your session has expired. Please log in again.';
  } else if (
    error.status === 403
  ) {
    message =
      'You do not have permission to perform this operation.';
  } else if (
    error.status === 404
  ) {
    message =
      message ||
      'The requested resource was not found.';
  } else if (
    error.status === 409
  ) {
    message =
      message ||
      'The operation conflicts with existing data.';
  } else if (
    error.status === 422
  ) {
    message =
      message ||
      'The submitted information could not be processed.';
  } else if (
    error.status >= 500
  ) {
    message =
      'A server error occurred. Please try again later.';
  } else {
    message =
      message ||
      'The operation could not be completed. Please try again.';
  }

  return {
    status: error.status,
    message,
    originalError: error,
  };
}

function extractBackendMessage(
  error: HttpErrorResponse,
): string {
  const response =
    error.error;

  if (
    typeof response === 'string'
  ) {
    return response.trim();
  }

  if (
    response &&
    typeof response === 'object'
  ) {
    const possibleResponse =
      response as {
        message?: unknown;
        Message?: unknown;
        error?: unknown;
        title?: unknown;
      };

    const possibleMessages = [
      possibleResponse.message,
      possibleResponse.Message,
      possibleResponse.error,
      possibleResponse.title,
    ];

    const backendMessage =
      possibleMessages.find(
        (
          value,
        ): value is string =>
          typeof value ===
            'string' &&
          value.trim().length > 0,
      );

    return (
      backendMessage?.trim() ??
      ''
    );
  }

  return '';
}