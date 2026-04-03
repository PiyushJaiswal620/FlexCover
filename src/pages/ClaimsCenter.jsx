import { useState } from 'react';
import {
  FileText, CheckCircle2, Clock, AlertTriangle, Search,
  IndianRupee, Zap, Eye, X, Download, ShieldAlert, Filter
} from 'lucide-react';
import {
  getStore, getCurrentRider, getRiderClaims, getCurrentPolicy,
  CLAIM_TYPES, updateClaimStatus, checkFraud, addClaim
} from '../data/store';

export default function ClaimsCenter() {
  const store = getStore();
  const rider = getCurrentRider();
  const [filter, setFilter] = useState('all');
  const [viewAll, setViewAll] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [, setTick] = useState(0);

  const allClaims = viewAll ? store.claims : getRiderClaims(rider?.id);
  const filteredClaims = filter === 'all' ? allClaims : allClaims.filter(c => c.status === filter);

  // Suggested claims for this rider
  const suggestedClaims = store.claims.filter(c => c.riderId === rider?.id && c.status === 'suggested');

  const confirmClaim = (claimId) => {
    updateClaimStatus(claimId, 'auto_approved');
    store.eventLog.unshift({
      id: `evt-${Date.now()}`, type: 'claim',
      message: `Claim ${claimId} auto-approved via one-tap confirmation`,
      timestamp: new Date().toISOString(), severity: 'info'
    });
    setTick(t => t + 1);
  };

  const startManualClaim = (typeId) => {
    const claimType = CLAIM_TYPES.find(c => c.id === typeId);
    const policy = getCurrentPolicy();
    if (!rider || !policy) return;

    const claim = addClaim({
      riderId: rider.id, riderName: rider.name, policyId: policy.id,
      triggerType: typeId, triggerLabel: claimType?.label || typeId,
      city: rider.city, zone: rider.zone?.name || rider.city,
      lostHours: 3, incomeLoss: 300, payoutAmount: 240,
      status: 'submitted',
    });

    // Run fraud check
    const fraudResult = checkFraud(claim, store.claims, rider);
    if (fraudResult.verdict === 'flagged') {
      claim.status = 'under_review';
      claim.fraudScore = fraudResult.fraudScore;
      claim.fraudFlags = fraudResult.flags;
    }

    setShowManual(false);
    setTick(t => t + 1);
  };

  const stats = {
    total: allClaims.length,
    pending: allClaims.filter(c => ['submitted', 'under_review', 'suggested'].includes(c.status)).length,
    approved: allClaims.filter(c => ['approved', 'auto_approved', 'paid'].includes(c.status)).length,
    rejected: allClaims.filter(c => c.status === 'rejected').length,
    totalPayout: allClaims.filter(c => ['approved', 'auto_approved', 'paid'].includes(c.status)).reduce((s, c) => s + c.payoutAmount, 0),
  };

  const statusConfig = {
    eligible: { color: 'text-blue-400', bg: 'bg-blue-400/10', icon: Eye },
    suggested: { color: 'text-primary-light', bg: 'bg-primary/10', icon: Zap },
    submitted: { color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
    under_review: { color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle },
    auto_approved: { color: 'text-success', bg: 'bg-success/10', icon: Zap },
    approved: { color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
    rejected: { color: 'text-danger', bg: 'bg-danger/10', icon: X },
    paid: { color: 'text-success', bg: 'bg-success/10', icon: IndianRupee },
  };

  return (
    <div className="space-y-5 max-w-6xl page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText size={20} className="text-primary-light" /> Claims Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">Track and manage income loss claims</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewAll(!viewAll)} className="btn-ghost py-2 px-3 text-xs">
            {viewAll ? 'My Claims' : 'All Claims'}
          </button>
          <button onClick={() => setShowManual(true)} className="btn-primary py-2 px-3 text-xs">
            <FileText size={13} /> New Claim
          </button>
        </div>
      </div>

      {/* Auto-Claim Suggestion Cards */}
      {suggestedClaims.length > 0 && (
        <div className="space-y-2">
          {suggestedClaims.map(claim => (
            <div key={claim.id} className="notification-card" style={{ background: 'rgba(14, 165, 233, 0.06)', borderColor: 'rgba(14, 165, 233, 0.2)' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                  <Zap size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">{claim.triggerLabel}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Detected in {claim.zone} • ~{claim.lostHours} hours lost
                  </div>
                  <div className="text-base font-bold text-primary-light mt-1">
                    Estimated payout: ₹{claim.payoutAmount}
                  </div>
                </div>
                <button onClick={() => confirmClaim(claim.id)} className="btn-primary py-2 px-4 text-xs shrink-0">
                  <CheckCircle2 size={14} /> Confirm
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Claims', value: stats.total, color: 'text-white' },
          { label: 'Pending', value: stats.pending, color: 'text-warning' },
          { label: 'Approved', value: stats.approved, color: 'text-success' },
          { label: 'Rejected', value: stats.rejected, color: 'text-danger' },
          { label: 'Total Payout', value: `₹${stats.totalPayout.toLocaleString('en-IN')}`, color: 'text-success' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-3 text-center">
            <div className="text-[10px] text-slate-500 mb-0.5">{s.label}</div>
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'suggested', 'submitted', 'under_review', 'auto_approved', 'approved', 'paid', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${
              filter === f ? 'bg-primary/15 text-primary-light border border-primary/25' : 'bg-white/[0.03] text-slate-400 border border-transparent hover:bg-white/[0.06]'
            }`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Claims List */}
      <div className="space-y-2">
        {filteredClaims.length === 0 ? (
          <div className="glass-card text-center py-12 text-slate-500 text-sm">No claims found.</div>
        ) : (
          filteredClaims.map(claim => {
            const cfg = statusConfig[claim.status] || statusConfig.submitted;
            const Icon = cfg.icon;
            return (
              <div key={claim.id} className="glass-card p-4 cursor-pointer hover:border-primary/15" onClick={() => setSelectedClaim(claim)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                      <Icon size={16} className={cfg.color} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{claim.triggerLabel}</div>
                      <div className="text-[11px] text-slate-500">
                        {claim.riderName} • {claim.city}, {claim.zone} • {new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-success">₹{claim.payoutAmount}</div>
                    <span className={`badge ${
                      ['approved', 'auto_approved', 'paid'].includes(claim.status) ? 'badge-success' :
                      claim.status === 'rejected' ? 'badge-danger' :
                      claim.status === 'suggested' ? 'badge-info' : 'badge-warning'
                    } text-[9px]`}>
                      {claim.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {claim.fraudFlags && claim.fraudFlags.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/[0.04] flex flex-wrap gap-1">
                    <ShieldAlert size={12} className="text-danger" />
                    {claim.fraudFlags.map((f, i) => (
                      <span key={i} className="text-[10px] text-danger/80 bg-danger/8 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedClaim(null)}>
          <div className="glass-card max-w-md w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white">Claim Details</h3>
              <button onClick={() => setSelectedClaim(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Claim ID', value: selectedClaim.id },
                { label: 'Type', value: selectedClaim.triggerLabel },
                { label: 'Rider', value: selectedClaim.riderName },
                { label: 'Location', value: `${selectedClaim.city}, ${selectedClaim.zone}` },
                { label: 'Hours Lost', value: `${selectedClaim.lostHours}h` },
                { label: 'Income Loss', value: `₹${selectedClaim.incomeLoss}` },
                { label: 'Payout', value: `₹${selectedClaim.payoutAmount}` },
                { label: 'Status', value: selectedClaim.status.replace('_', ' ') },
                { label: 'Created', value: new Date(selectedClaim.createdAt).toLocaleString('en-IN') },
                { label: 'Processed', value: selectedClaim.processedAt ? new Date(selectedClaim.processedAt).toLocaleString('en-IN') : 'Pending' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className="text-sm font-medium text-white">{item.value}</span>
                </div>
              ))}
            </div>
            {selectedClaim.status === 'suggested' && (
              <button onClick={() => { confirmClaim(selectedClaim.id); setSelectedClaim(null); }}
                className="w-full mt-4 btn-primary py-3 text-sm">
                <CheckCircle2 size={16} /> Confirm & Receive Payout
              </button>
            )}
          </div>
        </div>
      )}

      {/* Manual Claim Modal */}
      {showManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowManual(false)}>
          <div className="glass-card max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white">File Manual Claim</h3>
              <button onClick={() => setShowManual(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Select the type of income loss to file a claim for:</p>
            <div className="space-y-2">
              {CLAIM_TYPES.map(ct => (
                <button key={ct.id} onClick={() => startManualClaim(ct.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all text-left">
                  <span className="text-lg">{ct.icon}</span>
                  <span className="text-sm font-medium text-white">{ct.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-3">⚠️ Claims are validated against triggers, location, and policy coverage.</p>
          </div>
        </div>
      )}
    </div>
  );
}
