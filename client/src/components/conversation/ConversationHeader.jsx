import { ArrowLeft, RefreshCw, User, Phone, Tag, Building2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export function ConversationHeader({
  conversation,
  onBack,
  onRefresh,
  isRefreshing = false,
}) {
  const customer = conversation?.customer || {};
  const isClosed = conversation?.status === 'CLOSED';
  const brandDisplay =
    conversation?.brandId === 'verdant-co' ? 'Verdant Co' : conversation?.brandId || 'Verdant';

  return (
    <div className="conversation-header">
      <div className="header-main-row">
        <div className="header-customer-info">
          {onBack && (
            <button
              type="button"
              className="btn-back-mobile"
              onClick={onBack}
              aria-label="Back to conversations"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className="customer-avatar-lg">
            <User size={20} />
          </div>

          <div className="customer-meta-block">
            <div className="customer-name-row">
              <h3 className="customer-name-heading">
                {customer.name || 'Anonymous Customer'}
              </h3>
              <Badge
                variant={isClosed ? 'gray' : 'emerald'}
                size="sm"
                dot
              >
                {conversation?.status || 'OPEN'}
              </Badge>
            </div>

            <div className="customer-sub-meta">
              {customer.phone && (
                <span className="meta-item">
                  <Phone size={12} className="meta-icon" />
                  <span>{customer.phone}</span>
                </span>
              )}
              {customer.externalId && (
                <span className="meta-item">
                  <Tag size={12} className="meta-icon" />
                  <span>ID: {customer.externalId}</span>
                </span>
              )}
              <span className="meta-item">
                <Building2 size={12} className="meta-icon" />
                <span>{brandDisplay}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            title="Refresh messages and draft status"
            className="btn-refresh-conversation"
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin' : ''} />
            <span className="btn-refresh-text">Refresh</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

