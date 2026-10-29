import { useState, useEffect, useCallback, useRef } from 'react';
import { customerService } from '../services/customer.service';
import { useToast } from '../hooks/useToast';
import { generateUUID } from '../utils/validators';
import { CustomerIdentityForm } from '../components/customer/CustomerIdentityForm';
import { CustomerChat } from '../components/customer/CustomerChat';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const SESSION_STORAGE_KEY = 'datastraw_demo_customer_session';

export function CustomerPage() {
  const toast = useToast();

  // Load or initialize customer session identity
  const [identity, setIdentity] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          id: parsed.id || 'customer_demo_101',
          name: parsed.name || 'Aisha Sharma',
          phone: parsed.phone || '+919876543210',
          brand_id: parsed.brand_id || 'verdant-co',
          conversationId: parsed.conversationId || 'cmvt0wja10001s8uvv359rib0',
        };
      }
    } catch {
      // Storage unavailable
    }
    return {
      id: 'customer_demo_101',
      name: 'Aisha Sharma',
      phone: '+919876543210',
      brand_id: 'verdant-co',
      conversationId: 'cmvt0wja10001s8uvv359rib0',
    };
  });

  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const isFetchingRef = useRef(false);

  // Sync session storage when identity changes
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(identity));
    } catch {
      // Storage unavailable
    }
  }, [identity]);

  // Fetch customer conversation messages
  const fetchMessages = useCallback(
    async (isBackground = false) => {
      if (!identity.conversationId || isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (!isBackground) {
        setIsLoadingMessages(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const response = await customerService.getCustomerConversationMessages(
          identity.conversationId
        );
        if (response?.conversation?.messages) {
          setMessages(response.conversation.messages);
        }
      } catch (err) {
        if (!isBackground) {
          toast.error(err.message || 'Failed to load messages');
        }
      } finally {
        setIsLoadingMessages(false);
        setIsRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [identity.conversationId, toast]
  );

  // Initial load via microtask
  useEffect(() => {
    let ignore = false;

    if (identity.conversationId) {
      Promise.resolve().then(async () => {
        if (ignore) return;
        setIsLoadingMessages(true);

        try {
          const response = await customerService.getCustomerConversationMessages(
            identity.conversationId
          );
          if (!ignore && response?.conversation?.messages) {
            setMessages(response.conversation.messages);
          }
        } catch (err) {
          if (!ignore) {
            toast.error(err.message || 'Failed to load messages');
          }
        } finally {
          if (!ignore) {
            setIsLoadingMessages(false);
          }
        }
      });
    }

    return () => {
      ignore = true;
    };
  }, [identity.conversationId, toast]);

  // Auto-refresh interval (polling for new agent replies every 4 seconds)
  useEffect(() => {
    if (!autoRefresh || !identity.conversationId) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMessages(true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [autoRefresh, identity.conversationId, fetchMessages]);

  // Handle sending a new customer message
  const handleSendMessage = async (text) => {
    if (!text.trim() || isSending) return;

    setIsSending(true);
    const messageId = `msg_${generateUUID().substring(0, 12)}`;

    try {
      const response = await customerService.sendCustomerMessage({
        customer: {
          id: identity.id,
          name: identity.name,
          phone: identity.phone,
        },
        message: {
          id: messageId,
          text: text.trim(),
        },
        brand_id: identity.brand_id,
      });

      toast.success('Message sent! Waiting for support team review.');

      if (response.conversationId) {
        setIdentity((prev) => ({
          ...prev,
          conversationId: response.conversationId,
        }));
      }

      setMessages((prev) => [
        ...prev,
        {
          id: response.messageId || messageId,
          sender: 'CUSTOMER',
          text: text.trim(),
          createdAt: new Date().toISOString(),
        },
      ]);

      setTimeout(() => {
        if (response.conversationId || identity.conversationId) {
          fetchMessages(true);
        }
      }, 500);
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleResetSession = () => {
    const newId = `cust_${Date.now().toString(36)}`;
    const newIdentity = {
      id: newId,
      name: 'New Visitor',
      phone: '+919999900000',
      brand_id: 'verdant-co',
      conversationId: null,
    };
    setIdentity(newIdentity);
    setMessages([]);
    toast.info('Started a new customer session');
  };

  return (
    <div className="customer-page-container">
      {/* Informative Header Banner */}
      <div className="customer-demo-banner">
        <div className="banner-content">
          <div className="banner-title-row">
            <MessageSquare size={18} className="text-indigo" />
            <span className="banner-badge">Demo Mode</span>
            <h3>Customer Chat Simulation</h3>
          </div>
          <p className="banner-text">
            Simulates an external customer messaging Verdant Co. In this view, you can submit
            inquiries and verify that AI-generated reply drafts remain strictly confidential until an
            agent explicitly approves them in the Agent Inbox.
          </p>
        </div>

        <div className="banner-link-box">
          <Link to="/inbox" className="btn-link-agent" target="_blank" rel="noopener noreferrer">
            <span>Open Agent Inbox in New Tab</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* Main Grid: Identity Settings & Chat Window */}
      <div className="customer-layout-grid">
        <aside className="customer-sidebar-column">
          <CustomerIdentityForm
            identity={identity}
            onChange={setIdentity}
            onResetSession={handleResetSession}
            disabled={isSending}
          />

          <div className="customer-docs-tip">
            <h5>How to Test Human-in-the-Loop AI:</h5>
            <ol>
              <li>Type a customer inquiry below (e.g. &ldquo;Where is my order?&rdquo;) and click Send.</li>
              <li>Switch to the <strong>Agent Inbox</strong> tab to see the incoming message.</li>
              <li>Observe Gemini generating the draft in real-time.</li>
              <li>Edit the draft text and click <strong>Approve &amp; Send Reply</strong>.</li>
              <li>Return here to watch the approved reply appear instantly!</li>
            </ol>
          </div>
        </aside>

        <section className="customer-chat-column">
          <CustomerChat
            conversationId={identity.conversationId}
            messages={messages}
            isLoading={isLoadingMessages}
            isRefreshing={isRefreshing}
            isSending={isSending}
            onSendMessage={handleSendMessage}
            onRefresh={() => fetchMessages(false)}
            autoRefresh={autoRefresh}
            onToggleAutoRefresh={setAutoRefresh}
          />
        </section>
      </div>
    </div>
  );
}
