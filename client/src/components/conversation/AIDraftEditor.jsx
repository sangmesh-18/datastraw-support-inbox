import { useState } from 'react';
import { draftService } from '../../services/draft.service';
import { useToast } from '../../hooks/useToast';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import {
  Sparkles,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
} from 'lucide-react';

/**
 * Inner editor component keyed by draft.id so state automatically resets cleanly
 * without needing an effect-based state sync.
 */
function AIDraftForm({
  draft,
  isApproved,
  onConversationUpdated,
  onRefreshNeeded,
}) {
  const toast = useToast();
  const [draftText, setDraftText] = useState(draft.text || '');
  const [initialText, setInitialText] = useState(draft.text || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const isTextUnchanged = draftText.trim() === initialText.trim();
  const isTextEmpty = !draftText.trim();

  const handleSaveDraft = async () => {
    if (!draft?.id || isTextUnchanged || isTextEmpty || isApproved || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await draftService.updateDraft(draft.id, draftText);
      setInitialText(draftText);
      toast.success('AI draft updated successfully');
      if (onConversationUpdated) {
        onConversationUpdated(result.draft);
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to update draft';
      setSaveError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmApproval = async () => {
    if (!draft?.id || isApproved || isApproving) return;

    setIsApproving(true);
    setIsConfirmModalOpen(false);

    try {
      if (!isTextUnchanged && !isTextEmpty) {
        await draftService.updateDraft(draft.id, draftText);
      }

      await draftService.approveDraft(draft.id);
      toast.success('Reply approved and sent to conversation timeline!');
      if (onRefreshNeeded) {
        await onRefreshNeeded();
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to approve draft';
      toast.error(errorMsg);
    } finally {
      setIsApproving(false);
    }
  };

  const wordCount = draftText.trim() ? draftText.trim().split(/\s+/).length : 0;
  const charCount = draftText.length;

  return (
    <>
      {isApproved && (
        <div className="approved-notice-banner">
          <Lock size={15} className="lock-icon" />
          <span>
            This draft was approved and dispatched to the customer. Approved replies are immutable.
          </span>
        </div>
      )}

      <div className="draft-textarea-container">
        <textarea
          className={`draft-textarea ${isApproved ? 'is-disabled' : ''}`}
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="AI-generated draft text will appear here. Edit as needed..."
          rows={5}
          disabled={isApproved || isSaving || isApproving}
          aria-label="Editable AI draft text"
        />

        <div className="draft-meta-footer">
          <span className="count-stats">
            {wordCount} words &bull; {charCount} characters
          </span>
          {!isApproved && !isTextUnchanged && (
            <span className="unsaved-indicator">&bull; Unsaved changes</span>
          )}
        </div>
      </div>

      {saveError && (
        <div className="draft-error-banner" role="alert">
          <AlertTriangle size={14} />
          <span>{saveError}</span>
        </div>
      )}

      <div className="draft-actions-bar">
        <div className="actions-left">
          {!isApproved && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isTextUnchanged || isTextEmpty || isSaving || isApproving}
              isLoading={isSaving}
              icon={Save}
            >
              Save Draft
            </Button>
          )}
        </div>

        <div className="actions-right">
          {isApproved ? (
            <div className="approved-state-badge">
              <CheckCircle2 size={16} className="text-emerald" />
              <span>Approved &amp; Saved to Timeline</span>
            </div>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isTextEmpty || isApproving || isSaving}
              isLoading={isApproving}
              icon={Send}
              className="btn-approve-primary"
            >
              Approve &amp; Send Reply
            </Button>
          )}
        </div>
      </div>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmApproval}
        title="Approve & Send Agent Reply"
        confirmText="Confirm & Dispatch Reply"
        confirmVariant="primary"
        isConfirming={isApproving}
      >
        <div className="approval-modal-content">
          <p className="modal-description">
            You are about to approve this AI draft and convert it into an official support reply.
          </p>

          <div className="modal-draft-preview-box">
            <span className="preview-label">Final Message to Customer:</span>
            <p className="preview-body">{draftText}</p>
          </div>

          <div className="modal-warning-callout">
            <AlertTriangle size={16} className="warning-icon" />
            <span>
              Once approved, this message will immediately become visible to the customer in their chat view and cannot be un-sent.
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function AIDraftEditor({
  conversation,
  onConversationUpdated,
  onRefreshNeeded,
}) {
  const customerMessages = (conversation?.messages || []).filter(
    (m) => m.sender === 'CUSTOMER'
  );

  const pendingDraftMsg = [...customerMessages]
    .reverse()
    .find((m) => m.draft && m.draft.status === 'PENDING');

  const processingMsg = [...customerMessages]
    .reverse()
    .find(
      (m) =>
        (!m.draft || m.draft.status === 'PENDING') &&
        (m.aiProcessingStatus === 'PROCESSING' || m.aiProcessingStatus === 'PENDING')
    );

  const approvedDraftMsg = [...customerMessages]
    .reverse()
    .find((m) => m.draft && m.draft.status === 'APPROVED');

  const targetMessage = pendingDraftMsg || processingMsg || approvedDraftMsg || customerMessages[customerMessages.length - 1];
  const draft = targetMessage?.draft;

  const isApproved = draft?.status === 'APPROVED';
  const isPendingAI =
    targetMessage &&
    !draft &&
    (targetMessage.aiProcessingStatus === 'PENDING' ||
      targetMessage.aiProcessingStatus === 'PROCESSING');

  const isAIFailed =
    targetMessage &&
    !draft &&
    targetMessage.aiProcessingStatus === 'FAILED';

  return (
    <div className="ai-draft-card">
      <div className="draft-header">
        <div className="draft-title-wrap">
          <div className="draft-sparkle-icon">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="draft-title">AI Reply Assistant</h4>
            <p className="draft-policy-note">
              Critical Policy: AI drafts are never sent automatically. Human agent review and approval required.
            </p>
          </div>
        </div>

        <div className="draft-badges-wrap">
          {isApproved ? (
            <Badge variant="emerald" size="sm" dot>
              Approved &amp; Sent
            </Badge>
          ) : draft?.status === 'PENDING' ? (
            <Badge variant="indigo" size="sm" dot>
              Review Pending
            </Badge>
          ) : isPendingAI ? (
            <Badge variant="blue" size="sm" dot>
              AI Generating...
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="draft-body">
        {isPendingAI ? (
          <div className="draft-processing-placeholder">
            <div className="processing-indicator">
              <Loader2 size={24} className="spin text-indigo" />
            </div>
            <div className="processing-text-wrap">
              <h5>Gemini AI is analyzing customer message...</h5>
              <p>
                Synthesizing response based on brand policies and customer context.
                Please wait a moment or click refresh.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshNeeded}
              className="btn-check-ai"
            >
              <RefreshCw size={14} style={{ marginRight: 6 }} />
              Check Status
            </Button>
          </div>
        ) : isAIFailed ? (
          <div className="draft-failed-placeholder">
            <AlertTriangle size={24} className="text-danger" />
            <div className="processing-text-wrap">
              <h5>AI generation was unable to complete</h5>
              <p>
                The automated draft exceeded max retry attempts. You can craft a manual
                reply or refresh when the AI worker recovers.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshNeeded}
            >
              Retry
            </Button>
          </div>
        ) : !draft ? (
          <div className="draft-empty-placeholder">
            <Sparkles size={20} className="text-muted" />
            <p>Select a customer inquiry to review or generate an AI draft response.</p>
          </div>
        ) : (
          <AIDraftForm
            key={draft.id}
            draft={draft}
            isApproved={isApproved}
            onConversationUpdated={onConversationUpdated}
            onRefreshNeeded={onRefreshNeeded}
          />
        )}
      </div>
    </div>
  );
}
