import { useState, useEffect } from 'react';
import {
    Users, Shield, IndianRupee, AlertTriangle, TrendingUp,
    MapPin, Activity, CheckCircle2, AlertOctagon
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/analytics/summary')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const platformData = data.platforms.map((p, i) => ({
        name: p, value: Math.floor(data.totalWorkers / data.platforms.length) + (i % 3)
    }));

    return (
        <div className="space-y-6 max-w-7xl">
            <div>
                <h1 className="text-2xl font-bold text-white">Insurer Admin Console</h1>
                <p className="text-sm text-slate-400 mt-1">Platform-wide risk and claims analytics</p>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Active Policies', value: data.activePolicies, icon: Shield, color: 'text-primary-light', bg: 'bg-primary/10' },
                    { label: 'Total Workers', value: data.totalWorkers, icon: Users, color: 'text-secondary', bg: 'bg-secondary/10' },
                    { label: 'Weekly Claims', value: data.claimsThisWeek, icon: Activity, color: 'text-success', bg: 'bg-success/10' },
                    { label: 'Weekly Payout', value: `₹${(data.payoutThisWeek / 1000).toFixed(1)}k`, icon: IndianRupee, color: 'text-warning', bg: 'bg-warning/10' },
                    { label: 'Fraud Alerts', value: data.fraudAlerts, icon: AlertOctagon, color: 'text-danger', bg: 'bg-danger/10' },
                ].map((stat, i) => (
                    <div key={i} className="glass p-4 rounded-xl flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                            <stat.icon size={24} className={stat.color} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white leading-none mb-1">{stat.value}</div>
                            <div className="text-xs font-medium text-slate-400">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                {/* Main Chart */}
                <div className="lg:col-span-2 glass p-5 rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-semibold text-white">Claims & Payouts Trend (Last 8 Weeks)</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data.weeklyPayouts} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="payoutGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                axisLine={false} tickLine={false}
                                tickFormatter={v => `₹${v / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                                itemStyle={{ color: '#f1f5f9' }}
                                formatter={(v, name) => [name === 'payout' ? `₹${v}` : v, name === 'payout' ? 'Total Payout' : 'Claims Count']}
                            />
                            <Area type="monotone" dataKey="payout" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#payoutGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Platform Breakdown */}
                <div className="glass p-5 rounded-xl flex flex-col">
                    <h3 className="text-sm font-semibold text-white mb-2">Coverage by Platform</h3>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={platformData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {platformData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                                    itemStyle={{ color: '#f1f5f9' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* City Risk Heatmap */}
            <div className="glass p-5 rounded-xl">
                <h3 className="text-sm font-semibold text-white mb-6">Zone Risk Heatmap</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {Object.entries(data.riskByCity).map(([cityName, cityData]) => (
                        <div key={cityName} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-white flex items-center gap-2">
                                    <MapPin size={16} className="text-primary-light" /> {cityName}
                                </h4>
                                <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${cityData.avgRiskScore >= 60 ? 'bg-danger/20 text-danger' : cityData.avgRiskScore >= 35 ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                                    {cityData.avgRiskScore}/100
                                </div>
                            </div>

                            <div className="space-y-2">
                                {cityData.zones.map((zone, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">{zone.name}</span>
                                        <div className="flex items-center gap-2">
                                            {zone.floodProne && <span title="Flood Prone">🌊</span>}
                                            <span className={`w-2.5 h-2.5 rounded-full ${zone.riskLevel === 'high' ? 'bg-danger' : zone.riskLevel === 'medium' ? 'bg-warning' : 'bg-success'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/[0.04] flex justify-between text-xs text-slate-500">
                                <span>{cityData.workers} Workers</span>
                                <span>{cityData.policies} Policies</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
