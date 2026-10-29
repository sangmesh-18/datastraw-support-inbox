import { formatRelativeTime, truncate, getInitials } from '../../utils/formatters';
import { Sparkles, MessageCircle, Clock, CheckCheck } from 'lucide-react';
import { Badge } from '../common/Badge';

export function ConversationItem({ conversation, isSelected, onSelect }) {
  const customer = conversation.customer || {};
  const latestMessage = conversation.messages?.[0] || null;
  const brandDisplay =
    conversation.brandId === 'verdant-co' ? 'Verdant Co' : conversation.brandId || 'Verdant';

  const isClosed = conversation.status === 'CLOSED';
  const lastActiveTime = formatRelativeTime(
    conversation.updatedAt || latestMessage?.createdAt || conversation.createdAt
  );

  // Determine AI badge on conversation snippet
  const hasPendingAi =
    latestMessage?.sender === 'CUSTOMER' &&
    (latestMessage?.aiProcessingStatus === 'PENDING' ||
      latestMessage?.aiProcessingStatus === 'PROCESSING');

  const hasDraftReady =
    latestMessage?.sender === 'CUSTOMER' &&
    latestMessage?.aiProcessingStatus === 'COMPLETED';

  return (
    <div
      role="button"
      tabIndex={0}
      className={`conversation-item ${isSelected ? 'selected' : ''} ${isClosed ? 'is-closed' : ''}`}
      onClick={() => onSelect(conversation.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(conversation.id);
        }
      }}
      aria-selected={isSelected}
    >
      <div className="conversation-avatar" aria-hidden="true">
        {getInitials(customer.name || 'Unknown')}
      </div>

      <div className="conversation-content">
        <div className="conversation-top-row">
          <span className="customer-name" title={customer.name}>
            {customer.name || 'Anonymous Customer'}
          </span>
          <span className="conversation-time">
            <Clock size={11} style={{ marginRight: 3, verticalAlign: -1 }} />
            {lastActiveTime}
          </span>
        </div>

        <div className="conversation-sub-row">
          <span className="customer-phone">{customer.phone || customer.externalId || 'No phone'}</span>
          <Badge variant="gray" size="sm" className="brand-badge">
            {brandDisplay}
          </Badge>
        </div>

        <div className="conversation-message-preview">
          {latestMessage ? (
            <p className="preview-text">
              {latestMessage.sender === 'AGENT' && (
                <span className="agent-indicator">
                  <CheckCheck size={13} style={{ marginRight: 3, verticalAlign: -2 }} />
                  You:&nbsp;
                </span>
              )}
              {truncate(latestMessage.text, 65)}
            </p>
          ) : (
            <p className="preview-text preview-empty">
              <MessageCircle size={12} style={{ marginRight: 4, verticalAlign: -1 }} />
              New conversation started
            </p>
          )}
        </div>

        <div className="conversation-bottom-row">
          <Badge
            variant={isClosed ? 'gray' : 'emerald'}
            size="sm"
            dot
          >
            {conversation.status || 'OPEN'}
          </Badge>

          {hasDraftReady && (
            <span className="ai-ready-badge" title="AI draft ready for agent review">
              <Sparkles size={11} />
              <span>Draft Ready</span>
            </span>
          )}

          {hasPendingAi && (
            <span className="ai-pending-badge" title="AI draft in progress">
              <span className="ai-pulse-dot" />
              <span>AI Generating</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

