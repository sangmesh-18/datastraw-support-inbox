import { apiRequest } from './api';

export const customerService = {
  /**
   * Submit a customer message (public endpoint, simulates customer channel / webhook)
   * @param {{
   *   customer: { id: string, name: string, phone: string },
   *   message: { id: string, text: string },
   *   brand_id?: string
   * }} payload
   * @returns {Promise<{ success: boolean, message: string, customerId: string, conversationId: string, messageId: string }>}
   */
  async sendCustomerMessage({ customer, message, brand_id = 'verdant-co' }) {
    if (!customer?.id || !customer?.name?.trim() || !customer?.phone?.trim()) {
      throw new Error('Customer ID, Name, and Phone are required');
    }
    if (!message?.id || !message?.text?.trim()) {
      throw new Error('Message ID and text are required');
    }

    return apiRequest('/api/customer/messages', {
      method: 'POST',
      body: {
        customer: {
          id: customer.id.trim(),
          name: customer.name.trim(),
          phone: customer.phone.trim(),
        },
        message: {
          id: message.id.trim(),
          text: message.text.trim(),
        },
        brand_id: brand_id.trim() || 'verdant-co',
      },
      requireAuth: false,
    });
  },

  /**
   * Fetch customer-visible messages for a conversation (public endpoint, strictly excludes drafts and internal data)
   * @param {string} conversationId
   * @returns {Promise<{ success: boolean, conversation: { id: string, status: string, messages: Array } }>}
   */
  async getCustomerConversationMessages(conversationId) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    try {
      return await apiRequest(`/api/conversations/${conversationId}/customer-messages`, {
        method: 'GET',
        requireAuth: false,
      });
    } catch (error) {
      // Fallback in case backend routing variation
      if (error.status === 404 || error.status === 401) {
        return await apiRequest(`/api/customer-conversations/${conversationId}/customer-messages`, {
          method: 'GET',
          requireAuth: false,
        });
      }
      throw error;
    }
  },
};

