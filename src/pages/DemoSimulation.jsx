import { useState, useEffect } from 'react';
import {
    Zap, CloudRain, Thermometer, Wind, AlertOctagon,
    Clock, IndianRupee, ShieldAlert, BadgeCheck, MapPin
} from 'lucide-react';

export default function DemoSimulation() {
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetch('/api/cities').then(r => r.json()).then(d => {
            setCities(d.cities);
            setSelectedCity(d.cities[0]?.name || '');
        }).catch(() => { });
    }, []);

    const triggerEvent = async (type) => {
        setLoading(true);
        try {
            const res = await fetch('/api/triggers/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, city: selectedCity })
            });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const triggers = [
        { id: 'heavy_rain', label: 'Heavy Rain (>50mm)', icon: CloudRain, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { id: 'extreme_heat', label: 'Extreme Heat (>45°C)', icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { id: 'high_aqi', label: 'High AQI (>350)', icon: Wind, color: 'text-slate-400', bg: 'bg-slate-400/10' },
        { id: 'curfew', label: 'Local Curfew', icon: ShieldAlert, color: 'text-danger', bg: 'bg-danger/10' },
        { id: 'gps_spoof', label: 'Fraud: GPS Spoof', icon: MapPin, color: 'text-danger', bg: 'bg-danger/10' },
        { id: 'evidence_gap', label: 'Fraud: Evidence Gap', icon: AlertOctagon, color: 'text-danger', bg: 'bg-danger/10' },
    ];

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Zap className="text-primary-light" /> Event Simulator
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Trigger disruption events to test automatic claim generation.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Trigger Panel */}
                <div className="glass p-6 rounded-xl space-y-6">
                    <div>
                        <label className="text-sm font-semibold text-white mb-2 block">Target City</label>
                        <select
                            value={selectedCity}
                            onChange={e => setSelectedCity(e.target.value)}
                            className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                        >
                            {cities.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-white mb-3 block">Trigger Event</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {triggers.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => triggerEvent(t.id)}
                                    disabled={loading}
                                    className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-all disabled:opacity-50 text-left group"
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.bg} group-hover:scale-110 transition-transform`}>
                                        <t.icon className={t.color} size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-200">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="glass p-6 rounded-xl flex flex-col">
                    <h2 className="text-sm font-semibold text-white mb-4">Simulation Results</h2>

                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 py-10">
                            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <div className="text-sm animate-pulse">Processing event...</div>
                        </div>
                    ) : result ? (
                        <div className="flex-1 space-y-6 animate-fade-in">
                            {/* Event payload */}
                            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                                <div className="flex items-center gap-2 text-primary-light font-bold mb-1">
                                    <Zap size={16} /> {result.disruption.label} Detected!
                                </div>
                                <div className="text-sm text-slate-300">{result.disruption.data.description}</div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                                    <div className="text-xs text-slate-500 mb-1">Affected Workers</div>
                                    <div className="text-xl font-bold text-white">{result.affectedWorkers}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                                    <div className="text-xs text-slate-500 mb-1">Total Payout Calculated</div>
                                    <div className="text-xl font-bold text-success">₹{result.totalPayout.toLocaleString('en-IN')}</div>
                                </div>
                            </div>

                            {/* Logs */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Action Log</h3>
                                <div className="space-y-3 font-mono text-xs">
                                    <div className="flex gap-3 text-slate-400">
                                        <span className="text-blue-400">[{new Date().toLocaleTimeString()}]</span>
                                        <span>System received external sensor data.</span>
                                    </div>
                                    <div className="flex gap-3 text-slate-400">
                                        <span className="text-blue-400">[{new Date().toLocaleTimeString()}]</span>
                                        <span>Identified {result.affectedWorkers} active policies in {selectedCity}.</span>
                                    </div>
                                    <div className="flex gap-3 text-slate-400">
                                        <span className="text-blue-400">[{new Date().toLocaleTimeString()}]</span>
                                        <span>Calculating income loss based on worker averages...</span>
                                    </div>
                                    {result.fraudChecks.some(f => f.verdict !== 'clean') && (
                                        <div className="flex gap-3 text-warning font-bold">
                                            <span className="text-blue-400 font-normal">[{new Date().toLocaleTimeString()}]</span>
                                            <span>System flagged {result.fraudChecks.filter(f => f.verdict !== 'clean').length} claims for review.</span>
                                        </div>
                                    )}
                                    <div className="flex gap-3 text-success font-bold">
                                        <span className="text-blue-400 font-normal">[{new Date().toLocaleTimeString()}]</span>
                                        <span>{result.payments.length} payouts initiated successfully.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm py-10 text-center">
                            Select a city and trigger an event to see the parametric engine in action.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
