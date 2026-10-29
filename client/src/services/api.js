/**
 * Centralized API client wrapper for Datastraw Support Inbox
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';

const TOKEN_STORAGE_KEY = 'datastraw_agent_token';

export const tokenStorage = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // Storage unavailable
    }
  },
  remove: () => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Storage unavailable
    }
  },
};

/**
 * Standard HTTP error class with status and response payload
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Centralized request helper
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    requireAuth = true,
  } = options;

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const requestHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  if (requireAuth) {
    const token = tokenStorage.get();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers: requestHeaders,
  };

  if (body !== null && body !== undefined) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new ApiError(
      'Unable to connect to server. Please check that the backend is running.',
      0,
      { originalError: networkError.message }
    );
  }

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      // No JSON payload
    }
  } else {
    try {
      const text = await response.text();
      data = { message: text };
    } catch {
      // No text payload
    }
  }

  if (!response.ok) {
    const status = response.status;
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${status}`;

    // Handle session expiry on 401
    if (status === 401 && requireAuth) {
      window.dispatchEvent(
        new CustomEvent('datastraw:unauthorized', {
          detail: { message },
        })
      );
    }

    throw new ApiError(message, status, data);
  }

  return data;
}
