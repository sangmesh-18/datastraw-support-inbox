import { formatDateTime } from '../../utils/formatters';
import { Sparkles, CheckCheck, Loader2, AlertCircle, User } from 'lucide-react';
import { Badge } from '../common/Badge';

export function MessageItem({ message, customerName }) {
  const isAgent = message.sender === 'AGENT';
  const timeFormatted = formatDateTime(message.createdAt);

  return (
    <div className={`message-bubble-row ${isAgent ? 'row-agent' : 'row-customer'}`}>
      <div className={`message-bubble ${isAgent ? 'bubble-agent' : 'bubble-customer'}`}>
        <div className="message-header-line">
          <div className="message-sender-identity">
            {isAgent ? (
              <>
                <span className="agent-badge-icon">
                  <CheckCheck size={13} />
                </span>
                <span className="sender-title">Support Agent</span>
              </>
            ) : (
              <>
                <span className="customer-badge-icon">
                  <User size={13} />
                </span>
                <span className="sender-title">{customerName || 'Customer'}</span>
              </>
            )}
          </div>
          <span className="message-time-stamp">{timeFormatted}</span>
        </div>

        <div className="message-text-body">
          {message.text}
        </div>

        {/* AI Status tag for customer inquiries */}
        {!isAgent && message.aiProcessingStatus && (
          <div className="message-ai-status-row">
            {message.aiProcessingStatus === 'PROCESSING' && (
              <Badge variant="blue" size="sm" className="ai-status-pill">
                <Loader2 size={11} className="spin" style={{ marginRight: 4 }} />
                AI is generating draft...
              </Badge>
            )}
            {message.aiProcessingStatus === 'PENDING' && (
              <Badge variant="amber" size="sm" className="ai-status-pill">
                <Sparkles size={11} style={{ marginRight: 4 }} />
                AI draft queued
              </Badge>
            )}
            {message.aiProcessingStatus === 'COMPLETED' && message.draft && (
              <Badge
                variant={message.draft.status === 'APPROVED' ? 'emerald' : 'indigo'}
                size="sm"
                className="ai-status-pill"
              >
                <Sparkles size={11} style={{ marginRight: 4 }} />
                {message.draft.status === 'APPROVED'
                  ? 'AI Draft Approved & Sent'
                  : 'AI Draft Ready for Review'}
              </Badge>
            )}
            {message.aiProcessingStatus === 'FAILED' && (
              <Badge variant="rose" size="sm" className="ai-status-pill">
                <AlertCircle size={11} style={{ marginRight: 4 }} />
                AI draft generation failed
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

