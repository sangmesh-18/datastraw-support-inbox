import { User, Phone, Tag, Building2, RotateCcw } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export function CustomerIdentityForm({
  identity,
  onChange,
  onResetSession,
  disabled = false,
}) {
  const PRESETS = [
    {
      id: 'customer_demo_101',
      name: 'Aisha Sharma',
      phone: '+919876543210',
      brand_id: 'verdant-co',
      label: 'Aisha Sharma (+919876543210)',
    },
    {
      id: 'cust_test_1001',
      name: 'Aisha Khan',
      phone: '+919800000001',
      brand_id: 'verdant-co',
      label: 'Aisha Khan (+919800000001)',
    },
  ];

  const handleApplyPreset = (preset) => {
    onChange({
      id: preset.id,
      name: preset.name,
      phone: preset.phone,
      brand_id: preset.brand_id,
    });
  };

  return (
    <div className="customer-identity-card">
      <div className="identity-header">
        <div className="identity-title-wrap">
          <User size={18} className="text-indigo" />
          <h4 className="identity-heading">Simulated Customer Identity</h4>
        </div>
        {onResetSession && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetSession}
            icon={RotateCcw}
            title="Start new customer session"
            className="btn-reset-session"
          >
            New Session
          </Button>
        )}
      </div>

      <p className="identity-helper">
        In production, customer identity is authenticated via WhatsApp/SMS Webhooks. For this demo,
        configure the simulated customer details below:
      </p>

      {/* Quick Demo Presets */}
      <div className="preset-buttons-row">
        <span className="preset-label">Quick select:</span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`preset-pill ${identity.id === p.id ? 'active' : ''}`}
            onClick={() => handleApplyPreset(p)}
            disabled={disabled}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="identity-form-grid">
        <Input
          label="Customer ID"
          value={identity.id}
          onChange={(e) => onChange({ ...identity, id: e.target.value })}
          placeholder="e.g. cust_demo_101"
          required
          disabled={disabled}
          icon={Tag}
        />

        <Input
          label="Full Name"
          value={identity.name}
          onChange={(e) => onChange({ ...identity, name: e.target.value })}
          placeholder="e.g. Aisha Sharma"
          required
          disabled={disabled}
          icon={User}
        />

        <Input
          label="Phone Number"
          value={identity.phone}
          onChange={(e) => onChange({ ...identity, phone: e.target.value })}
          placeholder="e.g. +919876543210"
          required
          disabled={disabled}
          icon={Phone}
        />

        <Input
          label="Brand Identifier"
          value={identity.brand_id || 'verdant-co'}
          onChange={(e) => onChange({ ...identity, brand_id: e.target.value })}
          placeholder="verdant-co"
          disabled={disabled}
          icon={Building2}
        />
      </div>
    </div>
  );
}

