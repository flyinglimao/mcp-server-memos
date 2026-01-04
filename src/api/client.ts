/**
 * Base API client for Memos
 * Handles HTTP requests, authentication, and error handling
 */

import type { ApiError, InstanceConfig } from '../types/index.js';

export class MemosApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public details: unknown[] = []
  ) {
    super(message);
    this.name = 'MemosApiError';
  }
}

export class MemosClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: InstanceConfig) {
    // Ensure no trailing slash
    this.baseUrl = config.host.replace(/\/+$/, '') + '/api/v1';
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      params?: Record<string, string | number | boolean | undefined>;
    } = {}
  ): Promise<T> {
    const url = new URL(this.baseUrl + path);

    // Add query parameters
    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url.toString(), fetchOptions);

    // Handle responses without body (e.g., 204 No Content)
    const contentType = response.headers.get('content-type');
    const hasJsonContent = contentType?.includes('application/json');

    let data: unknown;
    if (hasJsonContent || response.status !== 204) {
      try {
        data = await response.json();
      } catch {
        // If JSON parsing fails and response is not OK, throw error with status
        if (!response.ok) {
          throw new MemosApiError(
            response.status,
            `HTTP ${response.status}: ${response.statusText}`,
            []
          );
        }
        // For successful responses with no JSON, return empty object
        data = {};
      }
    } else {
      data = {};
    }

    if (!response.ok) {
      const error = data as ApiError;
      throw new MemosApiError(
        error.code ?? response.status,
        error.message ?? `HTTP ${response.status}: ${response.statusText}`,
        error.details ?? []
      );
    }

    return data as T;
  }

  // GET request
  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    return this.request<T>('GET', path, { params });
  }

  // POST request
  async post<T>(
    path: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    return this.request<T>('POST', path, { body, params });
  }

  // PATCH request
  async patch<T>(
    path: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    return this.request<T>('PATCH', path, { body, params });
  }

  // DELETE request
  async delete<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    return this.request<T>('DELETE', path, { params });
  }
}

/**
 * Create a client for a specific instance
 */
export function createClient(config: InstanceConfig): MemosClient {
  return new MemosClient(config);
}
