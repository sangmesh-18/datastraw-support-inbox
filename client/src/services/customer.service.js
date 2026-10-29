import { apiRequest } from './api';

const CUSTOMER_SESSION_TOKEN_KEY = 'datastraw_customer_session_token';

export const customerSessionStorage = {
  get: () => {
    try {
      return sessionStorage.getItem(CUSTOMER_SESSION_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      if (token) {
        sessionStorage.setItem(CUSTOMER_SESSION_TOKEN_KEY, token);
      }
    } catch {
      // Storage unavailable
    }
  },
  remove: () => {
    try {
      sessionStorage.removeItem(CUSTOMER_SESSION_TOKEN_KEY);
    } catch {
      // Storage unavailable
    }
  },
};

export const customerService = {
  /**
   * Submit a customer message.
   * If an active customer session exists, sends the session token in the headers
   * so the backend strictly appends to the verified conversation.
   * If no session exists, the backend initializes one and returns a sessionToken.
   */
  async sendCustomerMessage({ customer, message, brand_id = 'verdant-co' }) {
    if (!message?.id || !message?.text?.trim()) {
      throw new Error('Message ID and text are required');
    }

    const sessionToken = customerSessionStorage.get();
    const headers = {};
    if (sessionToken) {
      headers['x-customer-session'] = sessionToken;
    }

    const response = await apiRequest('/api/customer/messages', {
      method: 'POST',
      headers,
      body: {
        customer: {
          id: customer?.id?.trim() || `anon_${Date.now().toString(36)}`,
          name: customer?.name?.trim() || 'Guest Customer',
          phone: customer?.phone?.trim() || '+10000000000',
        },
        message: {
          id: message.id.trim(),
          text: message.text.trim(),
        },
        brand_id: brand_id.trim() || 'verdant-co',
      },
      requireAuth: false,
    });

    if (response?.sessionToken) {
      customerSessionStorage.set(response.sessionToken);
    }

    return response;
  },

  /**
   * Fetch conversation and messages for the current customer session.
   * Strictly isolated: only returns customer messages and approved agent replies.
   */
  async getCustomerConversation(conversationId = null) {
    const sessionToken = customerSessionStorage.get();

    if (!sessionToken) {
      return { conversation: null };
    }

    const headers = {
      'x-customer-session': sessionToken,
    };

    // If conversationId is supplied, use the ID-specific endpoint
    const endpoint = conversationId
      ? `/api/customer/conversations/${conversationId}/messages`
      : '/api/customer/conversation';

    try {
      return await apiRequest(endpoint, {
        method: 'GET',
        headers,
        requireAuth: false,
      });
    } catch (error) {
      // If 404 or 401, session is invalid or belongs to another conversation
      if (error.status === 401 || error.status === 404) {
        // Return null conversation so UI handles empty/reset state
        return { conversation: null, error: error.message };
      }
      throw error;
    }
  },

  /**
   * Backwards-compatible alias for fetching conversation messages with session verification
   */
  async getCustomerConversationMessages(conversationId) {
    return this.getCustomerConversation(conversationId);
  },

  /**
   * Clear active customer session to start fresh
   */
  clearCustomerSession() {
    customerSessionStorage.remove();
  },
};
