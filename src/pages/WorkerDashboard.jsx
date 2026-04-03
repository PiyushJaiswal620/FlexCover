import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, IndianRupee, TrendingUp, AlertTriangle, CloudRain,
  Thermometer, Wind, Clock, CheckCircle2, ArrowUpRight,
  Zap, Bell, ChevronRight, Activity, Droplets, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  getStore, getCurrentRider, getCurrentPolicy, getRiderClaims,
  setCurrentRider, calculateRiskScore
} from '../data/store';

export default function WorkerDashboard() {
  const nav = useNavigate();
  const store = getStore();
  const [, setTick] = useState(0);
  const rider = getCurrentRider();
  const policy = getCurrentPolicy();
  const claims = getRiderClaims(rider?.id);
  const riskScore = rider ? calculateRiskScore(rider) : 0;

  // Active triggers for this rider's city
  const activeTriggers = store.triggers.filter(t => t.city === rider?.city && !t.resolved);
  
  // Suggested claims for this rider
  const suggestedClaims = store.claims.filter(c => c.riderId === rider?.id && c.status === 'suggested');

  const earningsData = [
    { day: 'Mon', earned: 580, protected: 680 },
    { day: 'Tue', earned: 720, protected: 720 },
    { day: 'Wed', earned: 0, protected: 650 },
    { day: 'Thu', earned: 690, protected: 690 },
    { day: 'Fri', earned: 810, protected: 810 },
    { day: 'Sat', earned: 150, protected: 700 },
    { day: 'Sun', earned: 590, protected: 640 },
  ];

  const riskColor = riskScore >= 60 ? 'text-danger' : riskScore >= 35 ? 'text-warning' : 'text-success';
  const riskBg = riskScore >= 60 ? 'bg-danger/10 border-danger/20' : riskScore >= 35 ? 'bg-warning/10 border-warning/20' : 'bg-success/10 border-success/20';

  const weeklyProtected = rider ? Math.round((rider.avgWeeklyEarnings || 4200) * 0.8) : 0;
  const totalPaid = claims.filter(c => c.status === 'paid' || c.status === 'approved' || c.status === 'auto_approved').reduce((s, c) => s + c.payoutAmount, 0);

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Welcome back, {rider?.name?.split(' ')[0] || 'Partner'} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {rider?.platform} • {rider?.city} • {rider?.zone?.name}
          </p>
        </div>
        <select
          value={rider?.id || ''}
          onChange={e => { setCurrentRider(e.target.value); setTick(t => t + 1); }}
          className="input-field max-w-[200px] text-sm py-2"
        >
          {store.riders.map(r => (
            <option key={r.id} value={r.id}>{r.name} — {r.platform}</option>
          ))}
        </select>
      </div>

      {/* AI Insight Cards */}
      {activeTriggers.length > 0 && (
        <div className="space-y-2">
          {activeTriggers.slice(0, 2).map((t, i) => (
            <div key={i} className={`notification-card ${t.severity === 'high' ? 'danger' : 'warning'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.severity === 'high' ? 'bg-danger/15' : 'bg-warning/15'}`}>
                    <AlertTriangle size={18} className={t.severity === 'high' ? 'text-danger' : 'text-warning'} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.description.split('.')[0]}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{t.value} • {t.zone}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggested Claims - Auto-Claim Card */}
      {suggestedClaims.length > 0 && (
        <div className="notification-card" style={{ background: 'rgba(14, 165, 233, 0.06)', borderColor: 'rgba(14, 165, 233, 0.2)' }}>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white">Auto-Claim Available</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {suggestedClaims[0].triggerLabel} detected in your delivery zone.
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                You may have lost ~{suggestedClaims[0].lostHours} delivery hours today.
              </div>
              <div className="text-base font-bold text-primary-light mt-1.5">
                Estimated eligible payout: ₹{suggestedClaims[0].payoutAmount}
              </div>
            </div>
          </div>
          <button onClick={() => {
            suggestedClaims[0].status = 'auto_approved';
            suggestedClaims[0].processedAt = new Date().toISOString();
            setTick(t => t + 1);
          }} className="w-full btn-primary py-3 text-sm font-bold">
            <CheckCircle2 size={16} /> Confirm & Receive Payout — 1 Tap ✓
          </button>
        </div>
      )}

      {/* Safety Insight */}
      {activeTriggers.length === 0 && suggestedClaims.length === 0 && (
        <div className="notification-card success">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-success" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Your zone is safe today ✅</div>
              <div className="text-xs text-slate-400 mt-0.5">No disruptions detected. Ride safely!</div>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Weekly Premium', value: `₹${policy?.weeklyPremium || 0}`, sub: 'per week', icon: IndianRupee, color: 'text-primary-light', bg: 'bg-primary/10' },
          { label: 'Max Payout', value: `₹${(policy?.maxPayout || 0).toLocaleString('en-IN')}`, sub: policy?.planName || 'No plan', icon: Shield, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Risk Score', value: `${riskScore}/100`, sub: riskScore >= 60 ? 'High Risk' : riskScore >= 35 ? 'Medium' : 'Low Risk', icon: TrendingUp, color: riskColor, bg: riskBg },
          { label: 'Total Protected', value: `₹${totalPaid.toLocaleString('en-IN')}`, sub: 'earnings saved', icon: Zap, color: 'text-secondary', bg: 'bg-secondary/10' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon size={15} className={s.color} />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">{s.label}</span>
            </div>
            <div className={`text-xl font-bold ${s.color === riskColor ? riskColor : 'text-white'}`}>{s.value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Dashboard Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="glass-card cursor-pointer" onClick={() => nav('/policies')}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{policy?.planEmoji || '🛡️'}</span>
            <span className="text-xs text-slate-400">Active Plan</span>
          </div>
          <div className="text-sm font-bold text-white">{policy?.planName || 'No Plan'}</div>
          <div className="text-xs text-success mt-1 flex items-center gap-1">
            <CheckCircle2 size={11} /> Active <ChevronRight size={11} className="ml-auto text-slate-600" />
          </div>
        </div>

        <div className="glass-card">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-slate-400" />
            <span className="text-xs text-slate-400">Coverage Hours</span>
          </div>
          <div className="text-sm font-bold text-white">{policy?.coverageHours || 0}h / week</div>
          <div className="text-xs text-slate-500 mt-1">Next renewal: {policy ? new Date(policy.nextRenewal).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</div>
        </div>

        <div className="glass-card">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-slate-400" />
            <span className="text-xs text-slate-400">Auto-Claim Status</span>
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            {policy?.autoTrigger ? 'Enabled' : 'Disabled'}
          </div>
          <div className="text-xs text-slate-500 mt-1">{claims.filter(c => c.status === 'auto_approved').length} auto-approved this month</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-white mb-4">Weekly Earnings vs Protected Income</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={earningsData} barGap={3}>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f1d32', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={v => [`₹${v}`, '']}
              />
              <Bar dataKey="protected" fill="rgba(14,165,233,0.2)" radius={[6, 6, 0, 0]} name="Protected" />
              <Bar dataKey="earned" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Earned" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Breakdown */}
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-white mb-4">Risk Score Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Weather Risk', value: rider?.zone?.avgRainfall > 70 ? 28 : rider?.zone?.avgRainfall > 50 ? 16 : 8, max: 30, icon: CloudRain },
              { label: 'Flood Zone', value: rider?.zone?.floodProne ? 18 : 2, max: 20, icon: Droplets },
              { label: 'AQI Level', value: rider?.zone?.avgAQI > 300 ? 20 : rider?.zone?.avgAQI > 200 ? 12 : 5, max: 20, icon: Wind },
              { label: 'Heat Exposure', value: (rider?.zone?.avgTemp || 35) > 42 ? 15 : (rider?.zone?.avgTemp || 35) > 38 ? 8 : 3, max: 15, icon: Thermometer },
              { label: 'Working Hours', value: (rider?.avgDailyHours || 8) > 10 ? 12 : 6, max: 15, icon: Clock },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <item.icon size={12} className="text-slate-500" />
                    <span className="text-xs text-slate-300">{item.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{item.value}/{item.max}</span>
                </div>
                <div className="risk-meter">
                  <div className="risk-meter-fill gradient-primary" style={{ width: `${(item.value / item.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Claims + AI Recommendations */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Claims</h3>
            <button onClick={() => nav('/claims')} className="text-xs text-primary-light font-medium hover:underline">View All →</button>
          </div>
          {claims.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No claims yet — you're in the clear! 🎉</div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-auto">
              {claims.slice(0, 6).map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      c.status === 'paid' || c.status === 'approved' || c.status === 'auto_approved' ? 'bg-success/15 text-success' : c.status === 'suggested' ? 'bg-primary/15 text-primary' : 'bg-warning/15 text-warning'
                    }`}>
                      {c.status === 'paid' || c.status === 'approved' || c.status === 'auto_approved' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{c.triggerLabel}</div>
                      <div className="text-[11px] text-slate-500">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {c.lostHours}h lost</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-success">+₹{c.payoutAmount}</div>
                    <div className={`text-[10px] font-bold uppercase ${
                      c.status === 'paid' ? 'text-success' : c.status === 'approved' || c.status === 'auto_approved' ? 'text-success/70' : c.status === 'suggested' ? 'text-primary-light' : 'text-warning'
                    }`}>{c.status.replace('_', ' ')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Zap size={14} className="text-primary-light" /> AI Insights
          </h3>
          <div className="space-y-3">
            {[
              riskScore < 40 && { emoji: '🎉', text: 'You are eligible for lower premium next week!', color: 'text-success' },
              activeTriggers.length > 0 && { emoji: '⚠️', text: `${activeTriggers[0]?.description?.split('.')[0]} in your zone.`, color: 'text-warning' },
              claims.filter(c => c.status === 'suggested').length > 0 && { emoji: '📋', text: 'Your claim is ready to submit!', color: 'text-primary-light' },
              rider?.avgDailyHours >= 8 && { emoji: '⭐', text: 'Consistent worker! Premium discount applied.', color: 'text-success' },
              { emoji: '🌤️', text: activeTriggers.length === 0 ? 'Your zone looks safe for this evening.' : 'Heavy disruptions expected. Stay alert.', color: activeTriggers.length === 0 ? 'text-success' : 'text-warning' },
              { emoji: '📊', text: `Weekly protection: ₹${weeklyProtected.toLocaleString('en-IN')}`, color: 'text-primary-light' },
            ].filter(Boolean).slice(0, 5).map((insight, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-start gap-2">
                  <span className="text-base">{insight.emoji}</span>
                  <span className={`text-xs ${insight.color}`}>{insight.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
