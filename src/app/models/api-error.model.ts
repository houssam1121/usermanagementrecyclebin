export interface ApiError {
  status: number;
  message: string;
  originalError?: unknown;
}