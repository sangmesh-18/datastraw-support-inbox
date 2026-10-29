import { useState, useEffect, useCallback, useRef } from 'react';
import { customerService, customerSessionStorage } from '../services/customer.service';
import { useToast } from '../hooks/useToast';
import { generateUUID } from '../utils/validators';
import { CustomerIdentityForm } from '../components/customer/CustomerIdentityForm';
import { CustomerChat } from '../components/customer/CustomerChat';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const SESSION_STORAGE_KEY = 'datastraw_demo_customer_identity';

const createDefaultGuestIdentity = () => {
  const randSuffix = Math.floor(1000000 + Math.random() * 9000000);
  return {
    id: `guest_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    name: 'Guest Customer',
    phone: `+1555${randSuffix}`,
    brand_id: 'verdant-co',
    conversationId: null,
  };
};

export function CustomerPage() {
  const toast = useToast();

  // Load or initialize customer session identity
  const [identity, setIdentity] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id && parsed.name && parsed.phone) {
          return {
            id: parsed.id,
            name: parsed.name,
            phone: parsed.phone,
            brand_id: parsed.brand_id || 'verdant-co',
            conversationId: parsed.conversationId || null,
          };
        }
      }
    } catch {
      // Storage unavailable
    }
    return createDefaultGuestIdentity();
  });

  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const isFetchingRef = useRef(false);

  // Sync identity to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(identity));
    } catch {
      // Storage unavailable
    }
  }, [identity]);

  // Fetch customer conversation messages strictly for this session
  const fetchMessages = useCallback(
    async (isBackground = false) => {
      // Require an active session token and conversation ID
      const hasToken = Boolean(customerSessionStorage.get());
      if (!hasToken || isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (!isBackground) {
        setIsLoadingMessages(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const response = await customerService.getCustomerConversation(identity.conversationId);
        if (response?.conversation?.messages) {
          setMessages(response.conversation.messages);
        } else if (response?.conversation === null && identity.conversationId) {
          // If session is expired or belongs to another conversation
          setMessages([]);
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

  // Initial load on page mount
  useEffect(() => {
    let ignore = false;
    const hasToken = Boolean(customerSessionStorage.get());

    if (hasToken && identity.conversationId) {
      Promise.resolve().then(async () => {
        if (ignore) return;
        setIsLoadingMessages(true);

        try {
          const response = await customerService.getCustomerConversation(identity.conversationId);
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

  // Auto-refresh interval (polling for approved agent replies every 4 seconds)
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

      // Save verified conversationId returned from the server
      if (response.conversationId && response.conversationId !== identity.conversationId) {
        setIdentity((prev) => ({
          ...prev,
          conversationId: response.conversationId,
        }));
      }

      // Optimistically append customer's message to timeline
      setMessages((prev) => [
        ...prev,
        {
          id: response.messageId || messageId,
          sender: 'CUSTOMER',
          text: text.trim(),
          createdAt: new Date().toISOString(),
        },
      ]);

      // Re-fetch in background to sync database state
      setTimeout(() => {
        fetchMessages(true);
      }, 500);
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Reset to start a completely fresh, isolated customer session
  const handleResetSession = () => {
    customerService.clearCustomerSession();
    const newIdentity = createDefaultGuestIdentity();
    setIdentity(newIdentity);
    setMessages([]);
    toast.info('Started a new isolated customer session');
  };

  return (
    <div className="customer-page-container">
      {/* Informative Header Banner */}
      <div className="customer-demo-banner">
        <div className="banner-content">
          <div className="banner-title-row">
            <MessageSquare size={18} className="text-indigo" />
            <span className="banner-badge">Public Test</span>
            <h3>Customer Chat Simulation</h3>
          </div>
          <p className="banner-text">
            Simulates a customer inquiry. Each browser session is cryptographically isolated
            with a secure session token. AI drafts are strictly kept confidential and only approved
            agent replies appear in this chat.
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
            onChange={(newIdentity) => {
              // If user switches identity (e.g. clicks preset), reset session so messages do not cross-contaminate
              const idChanged = newIdentity.id !== identity.id;
              const phoneChanged = newIdentity.phone !== identity.phone;
              if (idChanged || phoneChanged) {
                customerService.clearCustomerSession();
                setIdentity({
                  ...newIdentity,
                  conversationId: null,
                });
                setMessages([]);
              } else {
                setIdentity(newIdentity);
              }
            }}
            onResetSession={handleResetSession}
            disabled={isSending}
          />

          <div className="customer-docs-tip">
            <h5>How Session Isolation Works:</h5>
            <ol>
              <li>When you send a message, the server assigns an unguessable session token.</li>
              <li>Your chat only displays your conversation. Other customers cannot read it.</li>
              <li>AI draft responses are generated in the background, but remain hidden here until an agent approves them.</li>
              <li>Click &ldquo;New Session&rdquo; anytime to test a completely independent customer thread.</li>
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
