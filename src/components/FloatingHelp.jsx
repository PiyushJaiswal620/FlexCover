import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, X, Shield, FileText, Headphones, AlertTriangle } from 'lucide-react';

export default function FloatingHelp() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const actions = [
    { icon: FileText, label: 'File Claim', color: '#0ea5e9', onClick: () => { nav('/claims'); setOpen(false); } },
    { icon: Shield, label: 'Check Coverage', color: '#22c55e', onClick: () => { nav('/policies'); setOpen(false); } },
    { icon: Headphones, label: 'Contact Support', color: '#6366f1', onClick: () => { alert('Support: 1800-FLEX-COV'); setOpen(false); } },
    { icon: AlertTriangle, label: 'Emergency Help', color: '#ef4444', onClick: () => { alert('Emergency helpline: 112'); setOpen(false); } },
  ];

  return (
    <div className="fab">
      {open && (
        <div className="fab-menu animate-slide-up">
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <div className="text-xs font-bold text-primary-light uppercase tracking-wider">One Tap Help</div>
          </div>
          {actions.map((a, i) => (
            <button key={i} className="fab-item" onClick={a.onClick}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: a.color + '18' }}>
                <a.icon size={16} style={{ color: a.color }} />
              </div>
              {a.label}
            </button>
          ))}
        </div>
      )}
      <button className="fab-button" onClick={() => setOpen(!open)} aria-label="Help menu">
        {open ? <X size={22} /> : <HelpCircle size={24} />}
      </button>
    </div>
  );
}
