import { useState, useEffect } from 'react';
import {
    Shield, IndianRupee, TrendingUp, AlertTriangle,
    CloudRain, Thermometer, Wind, Clock, CheckCircle2,
    ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function WorkerDashboard() {
    const [summary, setSummary] = useState(null);
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [workerPolicy, setWorkerPolicy] = useState(null);
    const [workerClaims, setWorkerClaims] = useState([]);
    const [forecasts, setForecasts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/analytics/summary').then(r => r.json()),
            fetch('/api/workers').then(r => r.json()),
            fetch('/api/forecasts/high-risk').then(r => r.json()),
        ]).then(([sum, wk, fc]) => {
            setSummary(sum);
            setWorkers(wk.workers);
            setForecasts(fc.forecasts || []);
            if (wk.workers.length > 0) {
                const w = wk.workers[0];
                setSelectedWorker(w);
                loadWorkerData(w.id);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const loadWorkerData = async (id) => {
        const [pRes, cRes] = await Promise.all([
            fetch(`/api/policies/${id}`).then(r => r.json()),
            fetch(`/api/claims/${id}`).then(r => r.json()),
        ]);
        setWorkerPolicy(pRes);
        setWorkerClaims(cRes.claims || []);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const riskColor = workerPolicy?.riskScore >= 65 ? 'text-danger' : workerPolicy?.riskScore >= 35 ? 'text-warning' : 'text-success';
    const riskBg = workerPolicy?.riskScore >= 65 ? 'bg-danger/10 border-danger/20' : workerPolicy?.riskScore >= 35 ? 'bg-warning/10 border-warning/20' : 'bg-success/10 border-success/20';

    // Mock earnings chart data
    const earningsData = [
        { day: 'Mon', earned: 580, protected: 680 },
        { day: 'Tue', earned: 720, protected: 720 },
        { day: 'Wed', earned: 0, protected: 650 },
        { day: 'Thu', earned: 690, protected: 690 },
        { day: 'Fri', earned: 810, protected: 810 },
        { day: 'Sat', earned: 150, protected: 700 },
        { day: 'Sun', earned: 590, protected: 640 },
    ];

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Worker Dashboard</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Welcome, {selectedWorker?.name || 'Worker'} • {selectedWorker?.platform} • {selectedWorker?.city}
                    </p>
                </div>
                <select
                    value={selectedWorker?.id || ''}
                    onChange={e => {
                        const w = workers.find(w => w.id === e.target.value);
                        setSelectedWorker(w);
                        loadWorkerData(w.id);
                    }}
                    className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 max-w-xs"
                >
                    {workers.map(w => (
                        <option key={w.id} value={w.id} className="bg-dark-800">{w.name} — {w.platform}</option>
                    ))}
                </select>
            </div>

            {/* Stat cards row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                            <IndianRupee size={16} className="text-primary-light" />
                        </div>
                        <span className="text-xs text-slate-400">Weekly Premium</span>
                    </div>
                    <div className="text-2xl font-bold text-white">₹{workerPolicy?.weeklyPremium || 0}</div>
                    <div className="text-xs text-slate-500 mt-1">per week</div>
                </div>

                <div className="glass p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
                            <Shield size={16} className="text-success" />
                        </div>
                        <span className="text-xs text-slate-400">Coverage Limit</span>
                    </div>
                    <div className="text-2xl font-bold text-white">₹{(workerPolicy?.coverageLimit || 0).toLocaleString('en-IN')}</div>
                    <div className={`text-xs mt-1 flex items-center gap-1 ${riskColor}`}>
                        <CheckCircle2 size={12} /> Active
                    </div>
                </div>

                <div className="glass p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-lg ${riskBg} flex items-center justify-center`}>
                            <TrendingUp size={16} className={riskColor} />
                        </div>
                        <span className="text-xs text-slate-400">Risk Score</span>
                    </div>
                    <div className={`text-2xl font-bold ${riskColor}`}>{workerPolicy?.riskScore || 0}/100</div>
                    <div className="text-xs text-slate-500 mt-1">{workerPolicy?.riskScore >= 65 ? 'High Risk' : workerPolicy?.riskScore >= 35 ? 'Medium Risk' : 'Low Risk'} zone</div>
                </div>

                <div className="glass p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                            <Zap size={16} className="text-accent" />
                        </div>
                        <span className="text-xs text-slate-400">Earnings Protected</span>
                    </div>
                    <div className="text-2xl font-bold text-white">₹{(selectedWorker?.avgDailyEarnings * 7 * 0.8 || 0).toLocaleString('en-IN')}</div>
                    <div className="text-xs text-success mt-1 flex items-center gap-1">
                        <ArrowUpRight size={12} /> Weekly
                    </div>
                </div>
            </div>

            {/* Charts row */}
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Earnings chart */}
                <div className="glass p-5 rounded-xl">
                    <h3 className="text-sm font-semibold text-white mb-4">Weekly Earnings vs Protected Income</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={earningsData} barGap={4}>
                            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                                itemStyle={{ color: '#f1f5f9' }}
                                formatter={(v) => [`₹${v}`, '']}
                            />
                            <Bar dataKey="protected" fill="rgba(99,102,241,0.3)" radius={[6, 6, 0, 0]} name="Protected" />
                            <Bar dataKey="earned" fill="#6366f1" radius={[6, 6, 0, 0]} name="Earned" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Risk score breakdown */}
                <div className="glass p-5 rounded-xl">
                    <h3 className="text-sm font-semibold text-white mb-4">Risk Score Breakdown</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Location Risk', value: workerPolicy?.riskScore >= 65 ? 35 : workerPolicy?.riskScore >= 35 ? 20 : 8, max: 35, icon: MapPinIcon },
                            { label: 'Weather History', value: 15, max: 15, icon: CloudRain },
                            { label: 'AQI Level', value: workerPolicy?.riskScore >= 65 ? 18 : 10, max: 18, icon: Wind },
                            { label: 'Working Hours', value: 10, max: 10, icon: Clock },
                            { label: 'Flood Zone', value: 12, max: 12, icon: AlertTriangle },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <item.icon size={13} className="text-slate-400" />
                                        <span className="text-xs text-slate-300">{item.label}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-300">{item.value}/{item.max}</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full gradient-primary transition-all duration-700"
                                        style={{ width: `${(item.value / item.max) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Claims history + Weather alerts */}
            <div className="grid lg:grid-cols-3 gap-4">
                {/* Claims */}
                <div className="lg:col-span-2 glass p-5 rounded-xl">
                    <h3 className="text-sm font-semibold text-white mb-4">Recent Claims</h3>
                    {workerClaims.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-sm">No claims yet — you're in the clear! 🎉</div>
                    ) : (
                        <div className="space-y-3 max-h-80 overflow-auto">
                            {workerClaims.slice(0, 10).map(c => (
                                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${c.status === 'approved' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                                            {c.status === 'approved' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">{c.triggerLabel}</div>
                                            <div className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-success">+₹{c.payoutAmount}</div>
                                        <div className="text-xs text-slate-400">{c.lostHours}h lost</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Weather alerts */}
                <div className="glass p-5 rounded-xl">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-warning" /> Risk Alerts
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-auto">
                        {forecasts.filter(f => f.city === selectedWorker?.city).slice(0, 5).map((f, i) => (
                            <div key={i} className={`p-3 rounded-xl border ${f.riskLevel === 'high' ? 'bg-danger/5 border-danger/15' : 'bg-warning/5 border-warning/15'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    {f.riskLevel === 'high' ? <CloudRain size={13} className="text-danger" /> : <Thermometer size={13} className="text-warning" />}
                                    <span className="text-xs font-semibold text-white">{f.zone}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${f.riskLevel === 'high' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                                        {f.riskLevel.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">{f.workerMessage}</p>
                            </div>
                        ))}
                        {forecasts.filter(f => f.city === selectedWorker?.city).length === 0 && (
                            <div className="text-center py-6 text-slate-500 text-xs">No alerts for your city ✅</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MapPinIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}
