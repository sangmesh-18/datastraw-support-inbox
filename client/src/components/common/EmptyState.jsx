import { Inbox } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no items to display at this time.',
  actionText = null,
  onAction = null,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      <div className="empty-state-icon">
        <Icon size={36} strokeWidth={1.5} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionText && onAction && (
        <div className="empty-state-action">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}

