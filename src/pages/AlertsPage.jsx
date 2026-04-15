import { useState, useEffect } from 'react';
import {
  Bell, CloudRain, Thermometer, Wind, AlertTriangle, MapPin,
  Zap, Droplets, ShieldAlert, Clock, Wifi, RefreshCw, BarChart3, TrendingUp, ShieldCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import * as api from '../api/client';
import { getStore, getCurrentRider, CLAIM_TYPES } from '../data/store';

const triggerButtons = [
  { id: 'heavy_rain', label: 'Heavy Rain', icon: CloudRain, color: '#3b82f6', bg: 'bg-blue-500/10' },
  { id: 'flood', label: 'Flood Alert', icon: Droplets, color: '#0ea5e9', bg: 'bg-cyan-500/10' },
  { id: 'heatwave', label: 'Heatwave', icon: Thermometer, color: '#ef4444', bg: 'bg-red-500/10' },
  { id: 'pollution', label: 'AQI Alert', icon: Wind, color: '#6b7280', bg: 'bg-gray-500/10' },
  { id: 'platform_outage', label: 'App Outage', icon: Wifi, color: '#8b5cf6', bg: 'bg-purple-500/10' },
  { id: 'zone_closure', label: 'Zone Closure', icon: ShieldAlert, color: '#f59e0b', bg: 'bg-amber-500/10' },
];

export default function AlertsPage() {
  const store = getStore();
  const rider = getCurrentRider();
  const [selectedCity, setSelectedCity] = useState(rider?.city || 'Mumbai');
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTriggers, setActiveTriggers] = useState(store.triggers.filter(t => !t.resolved));
  const [resolvedTriggers, setResolvedTriggers] = useState(store.triggers.filter(t => t.resolved));
  const [allTriggers, setAllTriggers] = useState(store.triggers);

  // Fetch live triggers from backend
  const fetchTriggers = async () => {
    try {
      const data = await api.getTriggers();
      if (data?.triggers) {
        setActiveTriggers(data.triggers.filter(t => !t.resolved));
        setResolvedTriggers(data.triggers.filter(t => t.resolved));
        setAllTriggers(data.triggers);
      }
    } catch (_) {
      // fallback to local store
      setActiveTriggers(store.triggers.filter(t => !t.resolved));
    }
  };

  useEffect(() => { fetchTriggers(); }, []);

  const CITIES_LIST = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Bhubaneswar'];

  const handleTrigger = async (type) => {
    setLoading(true);
    setSimResult(null);
    try {
      const result = await api.simulateTrigger(type, selectedCity);
      setSimResult({
        trigger: result.trigger || result.disruption,
        affected: result.affectedRiders,
        newClaims: result.newClaims || [],
        totalPayout: result.totalPayout,
      });
      await fetchTriggers();
    } catch (err) {
      // fallback to client-side store
      const { simulateTrigger } = await import('../data/store');
      const r = simulateTrigger(type, selectedCity);
      setSimResult({ trigger: r.trigger, affected: r.affected, newClaims: r.newClaims || [], totalPayout: 0 });
    } finally {
      setLoading(false);
    }
  };


  const severityColor = (s) => s === 'high' ? 'text-danger' : s === 'medium' ? 'text-warning' : 'text-success';
  const severityBg = (s) => s === 'high' ? 'bg-danger/8 border-danger/15' : s === 'medium' ? 'bg-warning/8 border-warning/15' : 'bg-success/8 border-success/15';

  return (
    <div className="space-y-6 max-w-6xl page-enter">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell size={20} className="text-primary-light" /> Alerts & Triggers
        </h1>
        <p className="text-sm text-slate-400 mt-1">Live disruption monitoring & parametric trigger simulation</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trigger Simulator */}
        <div className="lg:col-span-1 glass-card">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Zap size={14} className="text-primary-light" /> Trigger Simulator
          </h2>

          <div className="mb-4">
            <label className="text-xs text-slate-400 mb-1 block">Target City</label>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="input-field text-sm py-2">
              {CITIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            {triggerButtons.map(t => (
              <button key={t.id} onClick={() => handleTrigger(t.id)} disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] disabled:opacity-40 transition-all group text-left">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.bg} group-hover:scale-110 transition-transform`}>
                  <t.icon className="transition-colors" style={{ color: t.color }} size={18} />
                </div>
                <span className="text-sm font-medium text-slate-200">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Sim result */}
          {loading && (
            <div className="mt-4 text-center py-6">
              <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
              <div className="text-xs text-slate-400 animate-pulse">Processing event…</div>
            </div>
          )}

          {simResult && !loading && (
            <div className="mt-4 space-y-3 animate-fade-in">
              <div className="p-3 rounded-xl bg-primary/8 border border-primary/15">
                <div className="text-xs font-bold text-primary-light mb-1">⚡ Trigger Fired!</div>
                <div className="text-[11px] text-slate-400">{simResult.trigger.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <div className="text-[10px] text-slate-500">Affected</div>
                  <div className="text-lg font-bold text-white">{simResult.affected}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <div className="text-[10px] text-slate-500">Claims Created</div>
                  <div className="text-lg font-bold text-success">{simResult.newClaims.length}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Alerts Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Triggers */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              Active Alerts ({activeTriggers.length})
            </h2>
            {activeTriggers.length === 0 ? (
              <div className="glass-card text-center py-8 text-slate-500 text-sm">
                No active disruptions ✅ All zones clear.
              </div>
            ) : (
              <div className="space-y-2">
                {activeTriggers.map(t => {
                  const icon = t.type === 'heavy_rain' ? CloudRain : t.type === 'flood' ? Droplets : t.type === 'heatwave' ? Thermometer : t.type === 'pollution' ? Wind : t.type === 'platform_outage' ? Wifi : ShieldAlert;
                  const Icon = icon;
                  return (
                    <div key={t.id} className={`glass-card p-4 border ${severityBg(t.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.severity === 'high' ? 'bg-danger/15' : 'bg-warning/15'}`}>
                            <Icon size={20} className={severityColor(t.severity)} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{t.description}</div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                              <span className="flex items-center gap-1"><MapPin size={11} /> {t.city}, {t.zone}</span>
                              <span className="flex items-center gap-1"><Clock size={11} /> {new Date(t.triggeredAt || t.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs mt-1.5">
                              <span className="text-slate-400">Value: <strong className="text-white">{t.value}</strong></span>
                              <span className="text-slate-400">Threshold: <strong className="text-slate-300">{t.threshold}</strong></span>
                              <span className="text-slate-400">Riders: <strong className="text-white">{t.affectedRiders}</strong></span>
                            </div>
                          </div>
                        </div>
                        <span className={`badge ${t.severity === 'high' ? 'badge-danger' : 'badge-warning'}`}>
                          {t.severity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Event Timeline */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3">Event Timeline</h2>
            <div className="glass-card max-h-[400px] overflow-auto">
              <div className="space-y-0">
                {allTriggers.slice(0, 15).map((t, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border-b border-white/[0.03] last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-white">{t.description?.split('.')[0] || t.type}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{t.city}, {t.zone}</span>
                        <span>•</span>
                        <span>{new Date(t.triggeredAt || t.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        <span className={`badge ${t.resolved ? 'badge-success' : 'badge-warning'} text-[8px]`}>
                          {t.resolved ? 'Resolved' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 3: Predictive Intelligence */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card">
          <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 size={16} className="text-primary-light" /> 7-Day Risk Forecast (AI Simulation)
          </h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { day: 'Mon', risk: 12, claims: 2 },
                { day: 'Tue', risk: 18, claims: 3 },
                { day: 'Wed', risk: 65, claims: 14 },
                { day: 'Thu', risk: 85, claims: 28 },
                { day: 'Fri', risk: 45, claims: 12 },
                { day: 'Sat', risk: 25, claims: 5 },
                { day: 'Sun', risk: 15, claims: 2 },
              ]}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis hide />
                <Tooltip contentStyle={{background: '#0f1d32', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 11}} />
                <Area type="monotone" dataKey="risk" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={2} name="Disruption Prob. %" />
                <Area type="monotone" dataKey="claims" stroke="#f43f5e" fill="transparent" strokeWidth={2} strokeDasharray="5 5" name="Est. Claims" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              <span className="text-xs text-slate-300">Monsoon Peak predicted for Thursday (98% confidence)</span>
            </div>
            <button className="text-[10px] bg-primary/20 text-primary-light px-3 py-1 rounded-full font-bold uppercase tracking-wider">Adjust Reserves</button>
          </div>
        </div>

        <div className="glass-card flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-success" /> Reliability Stats
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Forecast Accuracy', value: '94.2%', trend: '+2.1%', icon: TrendingUp, color: 'text-success' },
                { label: 'Avg Payout Speed', value: '8.4s', trend: '-1.2s', icon: Zap, color: 'text-primary-light' },
                { label: 'Prevention Rate', value: '62%', trend: '+5%', icon: ShieldAlert, color: 'text-warning' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">{s.label}</div>
                    <div className="text-lg font-bold text-white">{s.value}</div>
                  </div>
                  <div className={`text-[10px] font-bold ${s.color} bg-white/[0.05] px-2 py-1 rounded-md flex items-center gap-1`}>
                    <s.icon size={10} /> {s.trend}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="text-[10px] text-slate-500 italic">
              *Predictive models are updated every 4 hours using multi-source environmental feeds.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
