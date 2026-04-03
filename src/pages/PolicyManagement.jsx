import { useState } from 'react';
import { Shield, CheckCircle2, Clock, Pause, Play, ChevronDown, ChevronUp, ArrowUpDown, Download, IndianRupee, Zap, RefreshCw, Star } from 'lucide-react';
import { getStore, getCurrentRider, getCurrentPolicy, PLANS, addPolicy, calculateWeeklyPremium } from '../data/store';

export default function PolicyManagement() {
  const store = getStore();
  const rider = getCurrentRider();
  const currentPolicy = getCurrentPolicy();
  const [, setTick] = useState(0);
  const [expandedPlan, setExpandedPlan] = useState(currentPolicy?.planId || null);
  const [showHistory, setShowHistory] = useState(false);

  const activatePlan = (planId) => {
    addPolicy(rider.id, planId);
    setTick(t => t + 1);
  };

  const togglePause = () => {
    if (currentPolicy) {
      currentPolicy.status = currentPolicy.status === 'active' ? 'paused' : 'active';
      setTick(t => t + 1);
    }
  };

  const renewPolicy = () => {
    if (currentPolicy) {
      const now = new Date();
      currentPolicy.startDate = now.toISOString();
      currentPolicy.endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      currentPolicy.nextRenewal = currentPolicy.endDate;
      currentPolicy.status = 'active';
      setTick(t => t + 1);
    }
  };

  const premiumCalc = rider ? calculateWeeklyPremium(rider, currentPolicy?.planId || 'weather') : null;

  // Days remaining
  const daysLeft = currentPolicy ? Math.max(0, Math.ceil((new Date(currentPolicy.endDate) - Date.now()) / (24 * 60 * 60 * 1000))) : 0;

  return (
    <div className="space-y-6 max-w-5xl page-enter">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield size={20} className="text-primary-light" /> Policy Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage your weekly income protection plans</p>
      </div>

      {/* Active Policy Summary */}
      {currentPolicy && (
        <div className="glass-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-2xl shadow-lg shadow-primary/20">
                {currentPolicy.planEmoji}
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Active Plan</div>
                <h2 className="text-lg font-bold text-white">{currentPolicy.planName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${currentPolicy.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {currentPolicy.status === 'active' ? '● Active' : '⏸ Paused'}
                  </span>
                  <span className="text-xs text-slate-500">{daysLeft} days left</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={togglePause} className="btn-ghost py-2 px-3 text-xs">
                {currentPolicy.status === 'active' ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Resume</>}
              </button>
              <button onClick={renewPolicy} className="btn-primary py-2 px-3 text-xs">
                <RefreshCw size={13} /> Renew Week
              </button>
            </div>
          </div>

          {/* Policy dashboard cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
            {[
              { label: 'Weekly Premium', value: `₹${currentPolicy.weeklyPremium}`, icon: IndianRupee },
              { label: 'Max Payout', value: `₹${currentPolicy.maxPayout.toLocaleString('en-IN')}`, icon: Shield },
              { label: 'Coverage Hours', value: `${currentPolicy.coverageHours}h`, icon: Clock },
              { label: 'Risk Score', value: `${premiumCalc?.riskScore || 0}/100`, icon: Zap },
              { label: 'Next Renewal', value: new Date(currentPolicy.nextRenewal).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), icon: RefreshCw },
              { label: 'Auto-Trigger', value: currentPolicy.autoTrigger ? 'ON' : 'OFF', icon: Zap },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                <item.icon size={14} className="text-slate-500 mx-auto mb-1" />
                <div className="text-[10px] text-slate-500 mb-0.5">{item.label}</div>
                <div className="text-sm font-bold text-white">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Coverage summary */}
          <div className="mt-4 pt-4 border-t border-white/[0.05]">
            <div className="text-xs text-slate-400 font-semibold mb-2">Covered Disruptions</div>
            <div className="flex flex-wrap gap-1.5">
              {currentPolicy.coveredDisruptions.map(d => (
                <span key={d} className="badge badge-info text-[10px]">✓ {d}</span>
              ))}
            </div>
          </div>

          {/* Download policy card */}
          <div className="mt-4 pt-4 border-t border-white/[0.05] flex justify-between items-center">
            <div className="text-xs text-slate-500">Policy ID: {currentPolicy.id}</div>
            <button className="btn-ghost py-1.5 px-3 text-[11px]">
              <Download size={12} /> Download Policy Card
            </button>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-sm font-bold text-white mb-4">Available Plans</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {PLANS.map(plan => {
            const isActive = currentPolicy?.planId === plan.id;
            const premEst = rider ? calculateWeeklyPremium(rider, plan.id) : { finalPremium: plan.basePremium, riskScore: 0 };
            const expanded = expandedPlan === plan.id;

            return (
              <div key={plan.id} className={`glass-card relative transition-all ${isActive ? 'ring-1 ring-primary/30 border-primary/20' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-2 right-4">
                    <span className="badge badge-info text-[9px] shadow-lg shadow-primary/20">
                      <Star size={9} /> Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{plan.emoji}</span>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{plan.description}</p>
                  </div>
                </div>

                <div className="flex items-end gap-1 mb-3">
                  <span className="text-2xl font-bold text-gradient">₹{premEst.finalPremium}</span>
                  <span className="text-xs text-slate-500 mb-1">/ week</span>
                </div>

                <div className="flex gap-4 text-xs text-slate-400 mb-3">
                  <span>⚡ Max ₹{plan.maxPayout.toLocaleString('en-IN')}/wk</span>
                  <span>🕐 {plan.coverageHours}h</span>
                </div>

                <button onClick={() => setExpandedPlan(expanded ? null : plan.id)}
                  className="text-xs text-primary-light flex items-center gap-1 mb-3 hover:underline">
                  {expanded ? 'Hide' : 'Show'} details {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {expanded && (
                  <div className="space-y-3 mb-3 animate-fade-in">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold mb-1.5">COVERED DISRUPTIONS</div>
                      <div className="flex flex-wrap gap-1">
                        {plan.coveredDisruptions.map(d => (
                          <span key={d} className="text-[10px] px-2 py-0.5 rounded-full bg-success/8 text-success border border-success/15">✓ {d}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold mb-1">CLAIM RULES</div>
                      <div className="text-xs text-slate-400">{plan.claimRules}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold mb-1">AUTO-TRIGGER</div>
                      <div className="text-xs text-slate-400">{plan.autoTrigger ? '✅ Eligible for zero-touch claims' : '❌ Manual claims only'}</div>
                    </div>
                  </div>
                )}

                <button onClick={() => activatePlan(plan.id)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-success/10 text-success border border-success/20 cursor-default'
                      : 'btn-primary'
                  }`}
                  disabled={isActive}>
                  {isActive ? (
                    <><CheckCircle2 size={14} /> Current Plan</>
                  ) : currentPolicy ? (
                    <><ArrowUpDown size={14} /> Switch to This Plan</>
                  ) : (
                    <><Shield size={14} /> Activate Plan</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Policies */}
      <div className="glass-card">
        <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between text-sm font-semibold text-white">
          <span>Policy History</span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
        </button>
        {showHistory && (
          <div className="mt-4 space-y-2 animate-fade-in">
            {[
              { plan: 'Lite Weekly Shield', period: 'Week 12, 2026', premium: '₹32', status: 'Completed' },
              { plan: 'Rain & Heat Protect', period: 'Week 11, 2026', premium: '₹48', status: 'Completed' },
              { plan: 'Rain & Heat Protect', period: 'Week 10, 2026', premium: '₹45', status: 'Completed' },
            ].map((h, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div>
                  <div className="text-sm font-medium text-white">{h.plan}</div>
                  <div className="text-xs text-slate-500">{h.period}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-300">{h.premium}</div>
                  <span className="badge badge-success text-[9px]">{h.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
