import { useState, useEffect } from 'react';
import { Cpu, Zap, Shield, AlertTriangle, Bell, Clock, CheckCircle2, TrendingUp, Activity, RefreshCw, Settings } from 'lucide-react';
import * as api from '../api/client';
import { getStore } from '../data/store';

export default function AutomationPage() {
  const store = getStore();
  const [, setTick] = useState(0);


  const DEFAULT_RULES = [
    { id: 1, name: 'Auto-Claim on Heavy Rain', condition: 'Rainfall > 50mm in delivery zone', action: 'Suggest claim to affected riders', status: 'active', triggers: 47 },
    { id: 2, name: 'Auto-Claim on Flood Alert', condition: 'Waterlogging Level ≥ 2 reported', action: 'Auto-initiate claim with 1-tap confirm', status: 'active', triggers: 23 },
    { id: 3, name: 'Heatwave Protection', condition: 'Temperature > 44°C', action: 'Trigger work-loss protection suggestion', status: 'active', triggers: 31 },
    { id: 4, name: 'AQI Emergency Stop', condition: 'AQI > 300 (Severe)', action: 'Mark delivery unsafe, suggest income claim', status: 'active', triggers: 18 },
    { id: 5, name: 'Platform Outage Detection', condition: 'App downtime > 1 hour', action: 'Auto-suggest platform outage claim', status: 'active', triggers: 12 },
    { id: 6, name: 'Premium Recalculation', condition: 'New trigger event detected', action: 'Recalculate premiums for next week', status: 'active', triggers: 89 },
    { id: 7, name: 'Fraud Pattern Detection', condition: 'Anomaly score > 50%', action: 'Flag claim for manual review', status: 'active', triggers: 7 },
    { id: 8, name: 'Auto-Renewal', condition: 'Policy expires in 24h', action: 'Auto-renew weekly policy', status: 'active', triggers: 156 },
  ];

  const [rules, setRules] = useState(DEFAULT_RULES);
  const [eventLog, setEventLog] = useState(store.eventLog);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rulesData, eventsData] = await Promise.all([
          api.getAutomationRules(),
          api.getAutomationEvents(50),
        ]);
        if (rulesData?.rules) setRules(rulesData.rules);
        if (eventsData?.events) setEventLog(eventsData.events);
      } catch (_) {
        // stay with defaults
      }
    };
    fetchData();
  }, []);

  const typeConfig = {
    trigger: { icon: Zap, color: 'text-primary-light', bg: 'bg-primary/10', label: 'Trigger' },
    claim: { icon: Shield, color: 'text-success', bg: 'bg-success/10', label: 'Claim' },
    fraud: { icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10', label: 'Fraud' },
    premium: { icon: TrendingUp, color: 'text-warning', bg: 'bg-warning/10', label: 'Premium' },
    payout: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Payout' },
    policy: { icon: RefreshCw, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Policy' },
  };

  // Stats
  const stats = {
    totalRules: rules.length,
    activeRules: rules.filter(r => r.status === 'active').length,
    totalTriggers: rules.reduce((s, r) => s + r.triggers, 0),
    eventsToday: eventLog.filter(e => Date.now() - new Date(e.timestamp).getTime() < 24 * 60 * 60 * 1000).length,
  };

  return (
    <div className="space-y-6 max-w-6xl page-enter">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu size={20} className="text-primary-light" /> Automation Engine
        </h1>
        <p className="text-sm text-slate-400 mt-1">Rules engine, automated triggers, and event monitoring</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Rules', value: stats.activeRules, icon: Settings, color: 'text-primary-light' },
          { label: 'Total Triggers', value: stats.totalTriggers, icon: Zap, color: 'text-warning' },
          { label: 'Events Today', value: stats.eventsToday, icon: Activity, color: 'text-success' },
          { label: 'Auto-approvals', value: store.claims.filter(c => c.status === 'auto_approved').length, icon: CheckCircle2, color: 'text-success' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <s.icon size={18} className={`${s.color} mx-auto mb-2`} />
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-[10px] text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Automation Rules */}
        <div>
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Settings size={14} className="text-slate-400" /> Automation Rules
          </h2>
          <div className="space-y-2">
            {rules.map(rule => (
              <div key={rule.id} className="glass-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {rule.id}
                    </div>
                    <h3 className="text-sm font-semibold text-white">{rule.name}</h3>
                  </div>
                  <div className={`toggle-switch ${rule.status === 'active' ? 'active' : ''}`} />
                </div>
                <div className="ml-9 space-y-1.5">
                  <div className="text-xs text-slate-400">
                    <span className="text-slate-500 font-medium">IF:</span> {rule.condition}
                  </div>
                  <div className="text-xs text-slate-400">
                    <span className="text-slate-500 font-medium">THEN:</span> {rule.action}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Zap size={10} /> {rule.triggers} times triggered
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Log */}
        <div>
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Activity size={14} className="text-slate-400" /> Live Event Log
          </h2>
          <div className="glass-card p-0 max-h-[600px] overflow-auto">
            <div className="sticky top-0 p-3 bg-[#060e1a]/90 backdrop-blur-md border-b border-white/[0.04] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Real-time Monitor</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {eventLog.map((evt, i) => {
                const cfg = typeConfig[evt.type] || typeConfig.trigger;
                const Icon = cfg.icon;
                return (
                  <div key={i} className="flex items-start gap-3 p-3 hover:bg-white/[0.02] transition-colors">
                    <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon size={13} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white">{evt.message}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <Clock size={9} />
                        {new Date(evt.timestamp).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                        <span className={`badge ${evt.severity === 'high' ? 'badge-danger' : evt.severity === 'medium' ? 'badge-warning' : 'badge-info'} text-[8px]`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {eventLog.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">No events recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
