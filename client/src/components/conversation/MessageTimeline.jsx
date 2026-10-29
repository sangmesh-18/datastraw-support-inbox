import { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { Skeleton } from '../common/Skeleton';
import { MessageSquare } from 'lucide-react';

export function MessageTimeline({
  messages = [],
  customerName = 'Customer',
  isLoading = false,
}) {
  const bottomRef = useRef(null);

  // Auto-scroll to latest message on messages update
  useEffect(() => {
    if (!isLoading && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="timeline-loading-stack">
        <div className="skeleton-msg-left">
          <Skeleton width="60%" height="60px" borderRadius="12px" />
        </div>
        <div className="skeleton-msg-right">
          <Skeleton width="55%" height="70px" borderRadius="12px" />
        </div>
        <div className="skeleton-msg-left">
          <Skeleton width="70%" height="50px" borderRadius="12px" />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="timeline-empty-wrap">
        <MessageSquare size={32} className="empty-timeline-icon" />
        <p className="empty-timeline-text">No messages in this conversation yet.</p>
      </div>
    );
  }

  return (
    <div className="message-timeline-container">
      <div className="timeline-notice-divider">
        <span>Conversation started</span>
      </div>

      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          customerName={customerName}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}

