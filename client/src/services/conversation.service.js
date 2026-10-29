import { apiRequest } from './api';

export const conversationService = {
  /**
   * Fetch all conversations for the agent inbox
   * @returns {Promise<{ success: boolean, count: number, conversations: Array }>}
   */
  async getConversations() {
    return apiRequest('/api/conversations', {
      method: 'GET',
      requireAuth: true,
    });
  },

  /**
   * Fetch detailed messages timeline and AI drafts for a specific conversation
   * @param {string} conversationId
   * @returns {Promise<{ success: boolean, conversation: Object }>}
   */
  async getConversationMessages(conversationId) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }
    return apiRequest(`/api/conversations/${conversationId}/messages`, {
      method: 'GET',
      requireAuth: true,
    });
  },
};

