import { Search, X } from 'lucide-react';

export function InboxSearch({ value, onChange, placeholder = 'Search by customer, phone, or message...' }) {
  return (
    <div className="inbox-search-box">
      <Search className="search-icon" size={16} />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search conversations"
      />
      {value && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

