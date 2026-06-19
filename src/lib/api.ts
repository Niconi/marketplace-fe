const API_URL = process.env.NEXT_PUBLIC_API_URL;

const TOKEN_KEY = "mp_admin_token";
const CUSTOMER_TOKEN_KEY = "mp_customer_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function setCustomerToken(token: string) {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
}

export function clearCustomerToken() {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
}

export interface ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  customerAuth?: boolean;
  isFormData?: boolean;
}

export async function api<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth, customerAuth, isFormData, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  } else if (customerAuth) {
    const token = getCustomerToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let finalBody: BodyInit | undefined;
  if (body !== undefined) {
    if (isFormData) {
      finalBody = body as FormData;
    } else {
      finalHeaders["Content-Type"] = "application/json";
      finalBody = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data?.message || "Terjadi kesalahan") as ApiError;
    error.status = res.status;
    error.errors = data?.errors;
    throw error;
  }

  return data as T;
}
