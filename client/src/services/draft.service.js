import { apiRequest } from './api';

export const draftService = {
  /**
   * Edit an AI-generated draft
   * @param {string} draftId
   * @param {string} text
   * @returns {Promise<{ success: boolean, message: string, draft: Object }>}
   */
  async updateDraft(draftId, text) {
    if (!draftId) throw new Error('Draft ID is required');
    if (typeof text !== 'string' || !text.trim()) {
      throw new Error('Draft text cannot be empty');
    }

    return apiRequest(`/api/drafts/${draftId}`, {
      method: 'PATCH',
      body: { text: text.trim() },
      requireAuth: true,
    });
  },

  /**
   * Approve an AI-generated draft to convert it to an official agent reply
   * @param {string} draftId
   * @returns {Promise<{ success: boolean, message: string, draft: Object }>}
   */
  async approveDraft(draftId) {
    if (!draftId) throw new Error('Draft ID is required');

    return apiRequest(`/api/drafts/${draftId}/approve`, {
      method: 'PATCH',
      requireAuth: true,
    });
  },
};

