import { apiRequest } from './api';

export const authService = {
  /**
   * Log in an agent
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ success: boolean, token: string, user: { id: string, name: string, email: string, role: string } }>}
   */
  async login({ email, password }) {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), password },
      requireAuth: false,
    });
  },

  /**
   * Register a new agent
   * @param {{ name: string, email: string, password: string }} userData
   * @returns {Promise<{ success: boolean, message: string, user: { id: string, name: string, email: string, role: string } }>}
   */
  async register({ name, email, password }) {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      },
      requireAuth: false,
    });
  },
};

