import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conversationService } from '../services/conversation.service';
import { useToast } from '../hooks/useToast';
import { ConversationList } from '../components/inbox/ConversationList';
import { ConversationHeader } from '../components/conversation/ConversationHeader';
import { MessageTimeline } from '../components/conversation/MessageTimeline';
import { AIDraftEditor } from '../components/conversation/AIDraftEditor';
import { EmptyState } from '../components/common/EmptyState';
import { MessageSquareDashed, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';

export function InboxPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Conversations list state
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isRefreshingList, setIsRefreshingList] = useState(false);
  const [conversationsError, setConversationsError] = useState(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected conversation details state
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isRefreshingDetails, setIsRefreshingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  // Active requests lock to prevent overlapping calls
  const isFetchingListRef = useRef(false);
  const isFetchingDetailsRef = useRef(false);

  // Fetch all conversations
  const fetchConversations = useCallback(
    async (isBackground = false) => {
      if (isFetchingListRef.current) return;
      isFetchingListRef.current = true;

      if (isBackground) {
        setIsRefreshingList(true);
      }
      setConversationsError(null);

      try {
        const response = await conversationService.getConversations();
        const list = response.conversations || [];
        setConversations(list);

        // If no conversationId in URL and we have conversations, select the first on desktop
        if (!conversationId && list.length > 0 && window.innerWidth > 768) {
          navigate(`/inbox/${list[0].id}`, { replace: true });
        }
      } catch (err) {
        const msg = err.message || 'Failed to fetch conversations';
        setConversationsError(msg);
        if (!isBackground) {
          toast.error(msg);
        }
      } finally {
        setIsLoadingConversations(false);
        setIsRefreshingList(false);
        isFetchingListRef.current = false;
      }
    },
    [conversationId, navigate, toast]
  );

  // Fetch specific conversation details
  const fetchConversationDetails = useCallback(
    async (id, isBackground = false) => {
      if (!id || isFetchingDetailsRef.current) return;
      isFetchingDetailsRef.current = true;

      if (isBackground) {
        setIsRefreshingDetails(true);
      }
      setDetailsError(null);

      try {
        const response = await conversationService.getConversationMessages(id);
        setSelectedConversation(response.conversation);
      } catch (err) {
        const msg = err.message || 'Failed to load conversation messages';
        setDetailsError(msg);
        toast.error(msg);
      } finally {
        setIsLoadingDetails(false);
        setIsRefreshingDetails(false);
        isFetchingDetailsRef.current = false;
      }
    },
    [toast]
  );

  // Initial load via asynchronous promise resolution
  useEffect(() => {
    let ignore = false;

    Promise.resolve().then(async () => {
      try {
        const response = await conversationService.getConversations();
        if (!ignore) {
          const list = response.conversations || [];
          setConversations(list);
          if (!conversationId && list.length > 0 && window.innerWidth > 768) {
            navigate(`/inbox/${list[0].id}`, { replace: true });
          }
        }
      } catch (err) {
        if (!ignore) {
          const msg = err.message || 'Failed to fetch conversations';
          setConversationsError(msg);
          toast.error(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoadingConversations(false);
        }
      }
    });

    return () => {
      ignore = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When conversationId URL param changes, fetch its details
  useEffect(() => {
    let ignore = false;

    if (conversationId) {
      Promise.resolve().then(async () => {
        if (ignore) return;
        setIsLoadingDetails(true);
        setDetailsError(null);

        try {
          const response = await conversationService.getConversationMessages(conversationId);
          if (!ignore) {
            setSelectedConversation(response.conversation);
          }
        } catch (err) {
          if (!ignore) {
            const msg = err.message || 'Failed to load conversation messages';
            setDetailsError(msg);
            toast.error(msg);
          }
        } finally {
          if (!ignore) {
            setIsLoadingDetails(false);
          }
        }
      });
    } else {
      Promise.resolve().then(() => {
        if (!ignore) setSelectedConversation(null);
      });
    }

    return () => {
      ignore = true;
    };
  }, [conversationId, toast]);

  // Periodic poll to check for new messages / AI worker updates every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchConversations(true);
        if (conversationId) {
          fetchConversationDetails(conversationId, true);
        }
      }
    }, 8000);

    return () => clearInterval(timer);
  }, [fetchConversations, fetchConversationDetails, conversationId]);

  const handleSelectConversation = (id) => {
    navigate(`/inbox/${id}`);
  };

  const handleBackToList = () => {
    navigate('/inbox');
  };

  const handleRefreshAll = async () => {
    await fetchConversations(true);
    if (conversationId) {
      await fetchConversationDetails(conversationId, true);
    }
  };

  // Called when AI draft is edited or approved
  const handleConversationUpdated = () => {
    fetchConversations(true);
    if (conversationId) {
      fetchConversationDetails(conversationId, true);
    }
  };

  return (
    <div className={`inbox-dashboard-layout ${conversationId ? 'has-active-selection' : ''}`}>
      {/* Left Sidebar: Conversations List */}
      <ConversationList
        conversations={conversations}
        selectedId={conversationId}
        onSelectConversation={handleSelectConversation}
        isLoading={isLoadingConversations}
        isRefreshing={isRefreshingList}
        error={conversationsError}
        onRefresh={() => fetchConversations(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Right Panel: Conversation Details & AI Draft Editor */}
      <section className="inbox-details-panel">
        {!conversationId ? (
          <div className="no-selection-placeholder">
            <EmptyState
              icon={MessageSquareDashed}
              title="No Conversation Selected"
              description="Choose a conversation from the left to view customer message history, review AI generated drafts, and approve replies."
            />
          </div>
        ) : detailsError ? (
          <div className="details-error-card">
            <AlertCircle size={32} className="text-danger" />
            <h3>Unable to load conversation</h3>
            <p>{detailsError}</p>
            <div className="error-actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fetchConversationDetails(conversationId, false)}
              >
                Retry
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBackToList}>
                Back to Inbox
              </Button>
            </div>
          </div>
        ) : (
          <div className="conversation-view-container">
            {/* Header */}
            <ConversationHeader
              conversation={selectedConversation}
              onBack={handleBackToList}
              onRefresh={() => fetchConversationDetails(conversationId, true)}
              isRefreshing={isRefreshingDetails}
            />

            {/* Scrollable Message Timeline */}
            <div className="conversation-timeline-scroll">
              <MessageTimeline
                messages={selectedConversation?.messages || []}
                customerName={selectedConversation?.customer?.name}
                isLoading={isLoadingDetails}
              />
            </div>

            {/* Sticky Bottom AI Draft Editor */}
            <div className="conversation-draft-section">
              <AIDraftEditor
                conversation={selectedConversation}
                onConversationUpdated={handleConversationUpdated}
                onRefreshNeeded={handleRefreshAll}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
