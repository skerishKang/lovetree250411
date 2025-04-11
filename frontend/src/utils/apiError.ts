import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (data?.message) {
      return {
        message: data.message,
        status,
        errors: data.errors,
      };
    }

    switch (status) {
      case 400:
        return { message: '잘못된 요청입니다.', status };
      case 401:
        return { message: '인증이 필요합니다.', status };
      case 403:
        return { message: '접근 권한이 없습니다.', status };
      case 404:
        return { message: '요청한 리소스를 찾을 수 없습니다.', status };
      case 422:
        return {
          message: '입력값이 올바르지 않습니다.',
          status,
          errors: data?.errors,
        };
      case 500:
        return { message: '서버 오류가 발생했습니다.', status };
      default:
        return { message: '알 수 없는 오류가 발생했습니다.', status };
    }
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: '알 수 없는 오류가 발생했습니다.' };
}; 