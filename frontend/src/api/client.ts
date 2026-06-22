import { ApiError } from './errors/ApiError';
import { tokenStorage } from '../auth/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_URL as string;

export async function fetchClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {

  const token = tokenStorage.get();
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Erro na API: ${response.statusText}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
      errorDetails = errorData;
    } catch {
      errorDetails = null;
    }


    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
