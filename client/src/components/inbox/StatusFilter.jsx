export function StatusFilter({ currentFilter, onSelectFilter, counts = { all: 0, open: 0, closed: 0 } }) {
  const tabs = [
    { id: 'ALL', label: 'All', count: counts.all },
    { id: 'OPEN', label: 'Open', count: counts.open },
    { id: 'CLOSED', label: 'Closed', count: counts.closed },
  ];

  return (
    <div className="status-filter-tabs" role="tablist" aria-label="Conversation status filter">
      {tabs.map((tab) => {
        const isActive = currentFilter === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`status-tab ${isActive ? 'active' : ''}`}
            onClick={() => onSelectFilter(tab.id)}
          >
            <span>{tab.label}</span>
            <span className="tab-count">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}

