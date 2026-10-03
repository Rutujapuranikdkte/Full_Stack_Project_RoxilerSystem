import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type || 'info'}`}
        >
          {toast.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />}
          {toast.type === 'error' && <AlertCircle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />}
          {toast.type === 'info' && <Info size={18} style={{ color: 'var(--info)', flexShrink: 0 }} />}
          
          <div style={{ flex: 1, wordBreak: 'break-word' }}>
            {toast.message}
          </div>

          <button 
            type="button" 
            onClick={() => onDismiss(toast.id)}
            style={{ 
              background: 'transparent', 
              color: 'var(--text-muted)', 
              border: 'none', 
              padding: '2px',
              cursor: 'pointer' 
            }}
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};
