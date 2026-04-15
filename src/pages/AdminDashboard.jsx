import { useState, useEffect } from 'react';
import {
  Users, Shield, IndianRupee, AlertTriangle, TrendingUp, MapPin,
  Activity, CheckCircle2, AlertOctagon, Search, Filter, Eye,
  BarChart3, Clock, Zap, ShieldAlert, X, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import * as api from '../api/client';
import { getStore, CITIES, PLANS, CLAIM_TYPES, checkFraud, updateClaimStatus } from '../data/store';

const COLORS = ['#0ea5e9', '#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#22c55e'];

export default function AdminDashboard() {
  const store = getStore();
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [claimReview, setClaimReview] = useState(null);
  const [tab, setTab] = useState('overview');

  // Live analytics state — pre-populated from local store, then refreshed from API
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weekClaims = store.claims.filter(c => now - new Date(c.createdAt).getTime() < weekMs);

  const [analytics, setAnalytics] = useState({
    totalRiders: store.workers?.length || store.riders?.length || 0,
    activePolicies: store.policies.filter(p => p.status === 'active').length,
    totalClaims: store.claims.length,
    claimsThisWeek: weekClaims.length,
    autoApproved: store.claims.filter(c => c.status === 'auto_approved').length,
    totalPayout: store.claims.filter(c => ['paid', 'approved', 'auto_approved'].includes(c.status)).reduce((s, c) => s + c.payoutAmount, 0),
    fraudAlerts: store.fraudAlerts.length,
    weeklyPayouts: Array.from({ length: 8 }, (_, i) => ({ week: `W${i + 1}`, payout: Math.floor(Math.random() * 5000 + 1000), claims: Math.floor(Math.random() * 8 + 1) })),
    claimsByType: CLAIM_TYPES.map(ct => ({ name: ct.label.split(' ').slice(0, 2).join(' '), value: store.claims.filter(c => c.triggerType === ct.id).length })).filter(c => c.value > 0),
    platformData: (() => { const d = {}; (store.workers || store.riders || []).forEach(r => { d[r.platform] = (d[r.platform] || 0) + 1; }); return Object.entries(d).map(([name, value]) => ({ name, value })); })(),
  });

  const [riders, setRiders] = useState(store.workers || store.riders || []);
  const [fraudAlerts, setFraudAlerts] = useState(store.fraudAlerts || []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsData, ridersData, fraudData] = await Promise.all([
          api.getAnalyticsSummary(),
          api.getRiders(),
          api.getFraudAlerts(),
        ]);
        if (analyticsData) {
          setAnalytics(prev => ({
            ...prev,
            ...analyticsData,
            claimsByType: Object.entries(analyticsData.claimsByType || {}).map(([type, value]) => ({
              name: type.replace(/_/g, ' '),
              value,
            })).filter(c => c.value > 0),
            platformData: Object.entries(analyticsData.platformData || {}).map(([name, value]) => ({ name, value })),
          }));
        }
        if (ridersData?.riders) setRiders(ridersData.riders);
        if (ridersData?.workers) setRiders(ridersData.workers);
        if (fraudData?.alerts) setFraudAlerts(fraudData.alerts);
      } catch (_) {
        // fallback to local store — already set in initial state
      }
    };
    loadData();
  }, []);

  const avgPremium = store.policies.length > 0
    ? Math.round(store.policies.reduce((s, p) => s + p.weeklyPremium, 0) / store.policies.length)
    : analytics.avgWeeklyPremium || 0;

  // Filtered riders
  let filteredRiders = riders;
  if (search) filteredRiders = filteredRiders.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()) || r.platform?.toLowerCase().includes(search.toLowerCase()));
  if (filterCity !== 'all') filteredRiders = filteredRiders.filter(r => r.city === filterCity);
  if (filterPlatform !== 'all') filteredRiders = filteredRiders.filter(r => r.platform === filterPlatform);

  const claimsByType = analytics.claimsByType || [];
  const platformChartData = analytics.platformData || [];
  const weeklyPayouts = analytics.weeklyPayouts || [];

  // Risk zones
  const riskZones = Object.entries(CITIES).map(([key, city]) => {
    const cityRiders = store.riders.filter(r => r.city === city.name);
    const cityPolicies = store.policies.filter(p => p.city === city.name);
    const avgRisk = cityPolicies.length > 0 ? Math.round(cityPolicies.reduce((s, p) => s + p.riskScore, 0) / cityPolicies.length) : 0;
    return { name: city.name, riders: cityRiders.length, policies: cityPolicies.length, avgRisk, zones: city.zones };
  });

  // Fraud queue uses API-fetched fraud alerts + local store claims flagged for review
  const fraudQueue = fraudAlerts.length > 0
    ? fraudAlerts
    : store.claims.filter(c => c.status === 'under_review' || c.status === 'flagged' || c.fraudFlags?.length > 0);

  const handleApprove = async (claimId) => {
    try { await api.updateClaimStatus(claimId, 'approved'); } catch (_) { updateClaimStatus(claimId, 'approved'); }
    setFraudAlerts(prev => prev.filter(a => a.claimId !== claimId));
    setClaimReview(null);
  };
  const handleReject = async (claimId) => {
    try { await api.updateClaimStatus(claimId, 'rejected'); } catch (_) { updateClaimStatus(claimId, 'rejected'); }
    setFraudAlerts(prev => prev.filter(a => a.claimId !== claimId));
    setClaimReview(null);
  };

  return (
    <div className="space-y-5 max-w-7xl page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 size={20} className="text-primary-light" /> Admin Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">Platform-wide analytics and management</p>
        </div>
        <div className="flex gap-2">
          {['overview', 'riders', 'fraud', 'intelligence'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                tab === t ? 'gradient-primary text-white' : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.06]'
              }`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: 'Riders', value: analytics.totalRiders || riders.length, icon: Users, color: 'text-primary-light', bg: 'bg-primary/10' },
          { label: 'Loss Ratio', value: `${analytics.lossRatio || 42}%`, icon: TrendingUp, color: (analytics.lossRatio > 70 ? 'text-danger' : 'text-success'), bg: (analytics.lossRatio > 70 ? 'bg-danger/10' : 'bg-success/10') },
          { label: 'Claims This Week', value: analytics.claimsThisWeek, icon: Activity, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Auto-Approved', value: analytics.autoApproved, icon: Zap, color: 'text-primary-light', bg: 'bg-primary/10' },
          { label: 'Monthly Premiums', value: `₹${((analytics.totalPremiums || 85000) / 1000).toFixed(1)}k`, icon: IndianRupee, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Fraud Alerts', value: analytics.fraudAlerts || fraudQueue.length, icon: AlertOctagon, color: 'text-danger', bg: 'bg-danger/10' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-3 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <div className="text-lg font-bold text-white leading-none">{s.value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass-card">
              <h3 className="text-sm font-semibold text-white mb-4">Weekly Payouts & Claims Trend</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyPayouts}>
                  <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f1d32', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="payout" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Payout (₹)" />
                  <Bar yAxisId="right" dataKey="claims" fill="rgba(14,165,233,0.2)" radius={[6, 6, 0, 0]} name="Claims #" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card flex flex-col">
              <h3 className="text-sm font-semibold text-white mb-2">Claims by Disruption</h3>
              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={claimsByType} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                      {claimsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f1d32', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 11 }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, color: '#64748b' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Risk Zone Map */}
          <div className="glass-card">
            <h3 className="text-sm font-semibold text-white mb-4">Risk Zone Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {riskZones.map(rz => (
                <div key={rz.name} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                      <MapPin size={13} className="text-primary-light" /> {rz.name}
                    </h4>
                    <span className={`badge ${rz.avgRisk >= 60 ? 'badge-danger' : rz.avgRisk >= 35 ? 'badge-warning' : 'badge-success'} text-[9px]`}>
                      {rz.avgRisk}/100
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {rz.zones.map(z => (
                      <div key={z.id} className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{z.name}</span>
                        <div className="flex items-center gap-1.5">
                          {z.floodProne && <span title="Flood Prone">🌊</span>}
                          <div className={`w-2 h-2 rounded-full ${z.riskLevel === 'high' ? 'bg-danger' : z.riskLevel === 'medium' ? 'bg-warning' : 'bg-success'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/[0.04] flex justify-between text-[10px] text-slate-500">
                    <span>{rz.riders} Riders</span>
                    <span>{rz.policies} Policies</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional analytics */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="glass-card p-4">
              <div className="text-[10px] text-slate-500 mb-1">Avg Weekly Premium</div>
              <div className="text-2xl font-bold text-gradient">₹{avgPremium}</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-[10px] text-slate-500 mb-1">Protected Worker Income</div>
              <div className="text-2xl font-bold text-success">₹{Math.round(store.riders.reduce((s, r) => s + (r.avgWeeklyEarnings || 4200) * 0.8, 0) / 1000)}k/wk</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-[10px] text-slate-500 mb-1">Platform Distribution</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {platformChartData.map((p, i) => (
                  <span key={i} className="badge badge-info text-[9px]">{p.name}: {p.value}</span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Phase 3: Predictive Analytics & Fraud Hotspots */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="glass-card">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Activity size={16} className="text-primary-light" /> Predictive Analytics: Next Week Forecast
              </h3>
              <div className="space-y-4">
                {[
                  { city: 'Mumbai', event: 'Heavy Monsoon Peak', probability: 85, impact: 'High', payoutEst: '₹1.2L', color: 'text-danger' },
                  { city: 'Delhi', event: 'AQI Spike (Post-Harvest)', probability: 65, impact: 'Medium', payoutEst: '₹45k', color: 'text-warning' },
                  { city: 'Bengaluru', event: 'Flash Flood Risk', probability: 30, impact: 'Low', payoutEst: '₹12k', color: 'text-success' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div>
                      <div className="text-sm font-bold text-white">{p.city} — {p.event}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">Estimated Claims: {p.payoutEst}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${p.color}`}>{p.probability}% Prob.</div>
                      <div className="text-[10px] text-slate-400 capitalize">{p.impact} Impact</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldAlert size={16} className="text-danger" /> Fraud Monitoring: Predictive Hotspots
              </h3>
              <div className="flex-1 flex flex-col justify-center items-center py-6 text-center">
                <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-3">
                  <MapPin size={30} className="text-danger animate-pulse" />
                </div>
                <div className="text-sm font-bold text-white">High Suspected Activity: Delhi (Rohini)</div>
                <p className="text-xs text-slate-400 mt-1 max-w-[250px]">
                  Detected 12 claims with matching IP footprints in the last 4 hours.
                </p>
                <button className="mt-4 px-4 py-2 bg-danger/15 text-danger border border-danger/20 rounded-lg text-xs font-bold hover:bg-danger/20 transition-all">
                  Apply Zone Monitoring
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'riders' && (
        <div>
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search riders..." className="input-field pl-9 text-sm py-2" />
            </div>
            <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className="input-field text-sm py-2 w-auto">
              <option value="all">All Cities</option>
              {Object.values(CITIES).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="glass-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-black/20">
                    {['Name', 'Platform', 'City / Zone', 'Risk', 'Premium', 'Plan', 'Claims', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredRiders.map(rider => {
                    const policy = store.policies.find(p => p.riderId === rider.id);
                    const claims = store.claims.filter(c => c.riderId === rider.id);
                    return (
                      <tr key={rider.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-white">{rider.name}</div>
                          <div className="text-[10px] text-slate-500">{rider.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">{rider.platform}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-300">{rider.city}</div>
                          <div className="text-[10px] text-slate-500">{rider.zone?.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${(policy?.riskScore || 0) >= 60 ? 'badge-danger' : (policy?.riskScore || 0) >= 35 ? 'badge-warning' : 'badge-success'} text-[9px]`}>
                            {policy?.riskScore || 0}/100
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-white">₹{policy?.weeklyPremium || 0}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{policy?.planName || '—'}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{claims.length}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${policy?.status === 'active' ? 'badge-success' : 'badge-warning'} text-[9px]`}>
                            {policy?.status || 'none'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'fraud' && (
        <div>
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <ShieldAlert size={14} className="text-danger" /> Fraud Review Queue ({fraudQueue.length})
          </h2>
          {fraudQueue.length === 0 ? (
            <div className="glass-card text-center py-12 text-slate-500 text-sm">No claims pending fraud review ✅</div>
          ) : (
            <div className="space-y-2">
              {fraudQueue.map(claim => (
                <div key={claim.id} className="glass-card p-4 border border-danger/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">{claim.triggerLabel}</div>
                      <div className="text-xs text-slate-400">{claim.riderName} • {claim.city}, {claim.zone}</div>
                      
                      {/* Detailed Fraud Evidence Flags */}
                      {claim.fraudFlags?.length > 0 && (
                        <div className="space-y-1.5 mt-3">
                          {claim.fraudFlags.map((f, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-danger/5 border border-danger/10">
                              <AlertCircle size={12} className="text-danger mt-0.5" />
                              <span className="text-[10px] text-slate-300">{f}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* GPS & Historical Evidence Visuals */}
                      <div className="mt-3 flex gap-3">
                        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                          <MapPin size={11} /> 
                          {claim.fraudFlags?.some(f => f.includes('GPS')) ? (
                            <span className="text-danger">GPS Mismatch (Out of Bounds)</span>
                          ) : (
                            <span className="text-success">Location Verified</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                          <Activity size={11} />
                          {claim.fraudFlags?.some(f => f.includes('Historical')) ? (
                            <span className="text-danger">Evidence Gap (No system trigger)</span>
                          ) : (
                            <span className="text-success">Parametric Event Confirmed</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleApprove(claim.id)} className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-semibold border border-success/20 hover:bg-success/20 transition-all">
                        <CheckCircle2 size={12} className="inline mr-1" /> Approve
                      </button>
                      <button onClick={() => handleReject(claim.id)} className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-semibold border border-danger/20 hover:bg-danger/20 transition-all">
                        <X size={12} className="inline mr-1" /> Reject
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-4 text-[10px] text-slate-500">
                    <span>Payout: ₹{claim.payoutAmount}</span>
                    <span>Hours: {claim.lostHours}h</span>
                    <span>Fraud Score: {claim.fraudScore || 'N/A'}</span>
                    <span>{new Date(claim.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'intelligence' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-danger" /> Adversarial Map: GPS Spoofing Hotspots
              </h3>
              <div className="relative aspect-square max-h-[400px] w-full bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
                {/* Simulated Grid Map */}
                <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-10">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="border border-white/10" />
                  ))}
                </div>
                
                {/* Actual Event Zone */}
                <div className="absolute w-32 h-32 bg-primary/20 rounded-full border border-primary/40 animate-pulse flex items-center justify-center">
                  <div className="text-[10px] font-bold text-primary-light uppercase">Event Zone</div>
                </div>

                {/* Fraudulent Claim Points */}
                {fraudQueue.map((claim, i) => (
                  <div key={i} 
                    className="absolute w-3 h-3 bg-danger rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] cursor-help group"
                    style={{ 
                      top: `${30 + (Math.random() * 40)}%`, 
                      left: `${20 + (Math.random() * 60)}%`,
                      animationDelay: `${i * 0.5}s`
                    }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-dark-900 rounded-lg border border-danger/30 text-[9px] opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="font-bold text-danger">Spoof Detected</div>
                      <div className="text-slate-400">{claim.riderName}</div>
                      <div className="text-slate-500">Dist: 14.2km</div>
                    </div>
                  </div>
                ))}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-black/60 p-3 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Truth Source</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-danger" />
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Anomalous Signals</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldAlert size={16} className="text-warning" /> Signal Analysis: Hardware Clustering
              </h3>
              <div className="space-y-4">
                <p className="text-xs text-slate-400">Detecting coordinated attacks sharing identical device signatures or IP footprints.</p>
                
                {[
                  { id: 'CID-9921', size: 12, city: 'Delhi', confidence: 98, device: 'OnePlus 9R', type: 'IP Correlation', color: 'text-danger' },
                  { id: 'CID-4402', size: 5, city: 'Mumbai', confidence: 72, device: 'Multiple', type: 'MAC Spoofing', color: 'text-warning' },
                  { id: 'CID-1182', size: 3, city: 'Bengaluru', confidence: 45, device: 'Redmi Note', type: 'Temporal Spike', color: 'text-primary' },
                ].map((cluster, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-bold text-white">Cluster {cluster.id}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{cluster.city} • {cluster.type}</div>
                      </div>
                      <div className={`text-xs font-bold ${cluster.color}`}>{cluster.confidence}% Match</div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex -space-x-2">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <div key={j} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-400">P{j+1}</div>
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-500">+{cluster.size - 4} more identities linked</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={16} className="text-primary-light" /> High-Fidelity Parametric Health
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Sensor Integrity', value: '99.9%', status: 'Nominal', icon: Zap, color: 'text-success' },
                { label: 'Avg Validation Latency', value: '142ms', status: 'Optimal', icon: Zap, color: 'text-primary-light' },
                { label: 'False Positive Rate', value: '0.8%', status: 'Low', icon: TrendingUp, color: 'text-success' },
                { label: 'Bypass Attempts', value: '1,442', status: '+12% wk/wk', icon: AlertOctagon, color: 'text-warning' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">{s.label}</div>
                    <div className="text-xl font-bold text-white">{s.value}</div>
                    <div className={`text-[10px] font-bold ${s.color} mt-1 flex items-center gap-1`}>
                      <Icon size={10} /> {s.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
