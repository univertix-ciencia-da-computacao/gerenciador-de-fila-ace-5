const BASE_URL = import.meta.env.VITE_API_URL as string;

export async function fetchClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    //tokens de autorização se tiver
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    //erros de requisição (400, 500...)
    throw new Error(`Erro na API: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}