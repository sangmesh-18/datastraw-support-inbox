import { useMemo } from 'react';
import { ConversationItem } from './ConversationItem';
import { InboxSearch } from './InboxSearch';
import { StatusFilter } from './StatusFilter';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';
import { RefreshCw, MessageSquareDashed, AlertCircle } from 'lucide-react';

export function ConversationList({
  conversations = [],
  selectedId,
  onSelectConversation,
  isLoading = false,
  isRefreshing = false,
  error = null,
  onRefresh,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) {
  // Compute counts for filter tabs
  const counts = useMemo(() => {
    let open = 0;
    let closed = 0;
    conversations.forEach((c) => {
      if (c.status === 'CLOSED') closed++;
      else open++;
    });
    return { all: conversations.length, open, closed };
  }, [conversations]);

  // Filter conversations based on search and status
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // 1. Status Filter
      if (statusFilter === 'OPEN' && conv.status === 'CLOSED') return false;
      if (statusFilter === 'CLOSED' && conv.status !== 'CLOSED') return false;

      // 2. Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const customerName = conv.customer?.name?.toLowerCase() || '';
      const customerPhone = conv.customer?.phone?.toLowerCase() || '';
      const customerExternalId = conv.customer?.externalId?.toLowerCase() || '';
      const lastMessageText = conv.messages?.[0]?.text?.toLowerCase() || '';

      return (
        customerName.includes(q) ||
        customerPhone.includes(q) ||
        customerExternalId.includes(q) ||
        lastMessageText.includes(q)
      );
    });
  }, [conversations, statusFilter, searchQuery]);

  return (
    <aside className="inbox-sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <div className="sidebar-title-wrap">
            <h2 className="sidebar-title">Inbox</h2>
            <span className="sidebar-count-badge">
              {conversations.length}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            disabled={isLoading || isRefreshing}
            title="Refresh conversations"
            className="btn-refresh"
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin' : ''} />
          </Button>
        </div>

        {/* Search Input */}
        <InboxSearch value={searchQuery} onChange={onSearchChange} />

        {/* Status Tabs */}
        <StatusFilter
          currentFilter={statusFilter}
          onSelectFilter={onStatusFilterChange}
          counts={counts}
        />
      </div>

      {/* Conversation List Body */}
      <div className="sidebar-list-container">
        {isLoading && conversations.length === 0 ? (
          <div className="sidebar-skeleton-stack">
            {[1, 2, 3, 4, 5].map((key) => (
              <div key={key} className="skeleton-item-card">
                <div className="skeleton-avatar-wrap">
                  <Skeleton width="40px" height="40px" borderRadius="50%" />
                </div>
                <div className="skeleton-content-wrap">
                  <Skeleton width="60%" height="16px" />
                  <Skeleton width="90%" height="13px" />
                  <Skeleton width="40%" height="12px" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="sidebar-error-card">
            <AlertCircle size={28} className="error-icon" />
            <h4 className="error-heading">Failed to load inbox</h4>
            <p className="error-text">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              isLoading={isRefreshing}
            >
              Retry Connection
            </Button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="sidebar-empty-wrap">
            {searchQuery ? (
              <EmptyState
                icon={MessageSquareDashed}
                title="No matching conversations"
                description={`No conversations found matching "${searchQuery}".`}
                actionText="Clear search filter"
                onAction={() => onSearchChange('')}
              />
            ) : statusFilter !== 'ALL' ? (
              <EmptyState
                icon={MessageSquareDashed}
                title={`No ${statusFilter.toLowerCase()} conversations`}
                description={`There are currently no ${statusFilter.toLowerCase()} tickets.`}
                actionText="View all conversations"
                onAction={() => onStatusFilterChange('ALL')}
              />
            ) : (
              <EmptyState
                icon={MessageSquareDashed}
                title="Inbox is empty"
                description="No customer conversations have been received yet. Test by sending a message from Customer View!"
              />
            )}
          </div>
        ) : (
          <div className="conversation-items-scroll">
            {filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={conv.id === selectedId}
                onSelect={onSelectConversation}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

