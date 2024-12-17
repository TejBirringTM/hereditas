import type { ErrorStatus } from "@oak/oak";

export interface ApiSuccessResult<TResponse extends object> {
  success: true;
  error: false;
  data: TResponse;
}

export interface ApiErrorResult {
  success: false;
  error: true;
  status: ErrorStatus;
  message: string;
  additionalInfo: object | undefined;
}

export function declareSuccessResponse<TResponse extends object>(
  response: TResponse,
): ApiSuccessResult<TResponse> {
  return {
    success: true,
    error: false,
    data: response,
  };
}

export function declareErrorResponse(
  errorStatus: ErrorStatus,
  errorMessage: string,
  errorInfo?: object | undefined,
): ApiErrorResult {
  return {
    success: false,
    error: true,
    status: errorStatus,
    message: errorMessage,
    additionalInfo: errorInfo,
  };
}
