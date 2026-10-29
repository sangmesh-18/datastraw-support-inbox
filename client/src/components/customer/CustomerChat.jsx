import { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, ShieldCheck, CheckCheck, User, MessageSquare } from 'lucide-react';
import { Button } from '../common/Button';
import { formatDateTime } from '../../utils/formatters';

export function CustomerChat({
  conversationId,
  messages = [],
  isLoading = false,
  isRefreshing = false,
  isSending = false,
  onSendMessage,
  onRefresh,
  autoRefresh = true,
  onToggleAutoRefresh,
}) {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!messageText.trim() || isSending) return;
    onSendMessage(messageText);
    setMessageText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="customer-chat-card">
      {/* Chat Header */}
      <div className="customer-chat-header">
        <div className="chat-title-group">
          <div className="online-indicator-dot" />
          <div>
            <h4 className="chat-brand-title">Verdant Co Support</h4>
            <span className="chat-subtitle">
              {conversationId ? `Session Ref: #${conversationId.substring(0, 10)}...` : 'New Support Inbound'}
            </span>
          </div>
        </div>

        <div className="chat-header-actions">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => onToggleAutoRefresh(e.target.checked)}
            />
            <span className="toggle-label-text">Auto-update (4s)</span>
          </label>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            disabled={!conversationId || isRefreshing}
            title="Refresh customer conversation"
            className="btn-chat-refresh"
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="customer-privacy-callout">
        <ShieldCheck size={16} className="text-emerald" />
        <span>
          Customer Privacy Protected: Only approved replies from support agents are visible here. Internal AI drafts are never exposed.
        </span>
      </div>

      {/* Message Timeline */}
      <div className="customer-messages-scroll">
        {isLoading && messages.length === 0 ? (
          <div className="customer-chat-empty">
            <RefreshCw size={24} className="spin text-indigo" />
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="customer-chat-empty">
            <MessageSquare size={36} className="text-muted" />
            <h5>Welcome to Verdant Co Support</h5>
            <p>
              Type your message below to start a conversation. An AI assistant will
              prepare a draft response for our support team to review and approve.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isAgent = msg.sender === 'AGENT';
            return (
              <div
                key={msg.id || idx}
                className={`customer-msg-row ${isAgent ? 'is-agent-reply' : 'is-customer-msg'}`}
              >
                <div className={`customer-bubble ${isAgent ? 'bubble-agent-received' : 'bubble-customer-sent'}`}>
                  <div className="bubble-header">
                    <span className="bubble-sender-name">
                      {isAgent ? (
                        <>
                          <CheckCheck size={13} style={{ marginRight: 3, verticalAlign: -1 }} />
                          Verdant Support Agent
                        </>
                      ) : (
                        <>
                          <User size={13} style={{ marginRight: 3, verticalAlign: -1 }} />
                          You
                        </>
                      )}
                    </span>
                    <span className="bubble-time">{formatDateTime(msg.createdAt)}</span>
                  </div>
                  <div className="bubble-body">{msg.text}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <form onSubmit={handleSubmit} className="customer-composer-form">
        <textarea
          className="customer-composer-input"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here... (Press Enter to send)"
          rows={2}
          disabled={isSending}
          aria-label="Message text"
        />

        <div className="composer-footer">
          <span className="composer-helper-note">
            Simulates customer sending a message into the webhook inbox
          </span>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!messageText.trim() || isSending}
            isLoading={isSending}
            icon={Send}
            className="btn-send-customer"
          >
            Send Message
          </Button>
        </div>
      </form>
    </div>
  );
}
