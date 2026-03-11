import { useState, useEffect } from 'react';
import { Bell, CloudRain, Thermometer, Wind, AlertTriangle, MapPin } from 'lucide-react';

export default function PredictiveAlerts() {
    const [forecasts, setForecasts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/forecasts')
            .then(r => r.json())
            .then(d => { setForecasts(d.forecasts); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    // Filter out low risk for the main view
    const highRisk = forecasts.filter(f => f.riskLevel === 'high');
    const mediumRisk = forecasts.filter(f => f.riskLevel === 'medium');

    return (
        <div className="space-y-6 max-w-7xl">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Bell className="text-primary-light" /> Risk Alerts
                </h1>
                <p className="text-sm text-slate-400 mt-1">Weather & Disruption Forecasts (24-48h)</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-danger flex items-center gap-2">
                        <AlertTriangle size={16} /> High Risk Zones (Next 24h)
                    </h2>
                    {highRisk.length === 0 ? (
                        <div className="glass p-6 text-center text-slate-400 text-sm rounded-xl">No high risk forecasts today.</div>
                    ) : (
                        highRisk.map((f, i) => <AlertCard key={i} forecast={f} />)
                    )}
                </div>

                <div className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-warning flex items-center gap-2">
                        <AlertTriangle size={16} /> Medium Risk Zones
                    </h2>
                    {mediumRisk.length === 0 ? (
                        <div className="glass p-6 text-center text-slate-400 text-sm rounded-xl">No medium risk forecasts today.</div>
                    ) : (
                        mediumRisk.map((f, i) => <AlertCard key={i} forecast={f} />)
                    )}
                </div>
            </div>
        </div>
    );
}

function AlertCard({ forecast }) {
    const isHigh = forecast.riskLevel === 'high';

    return (
        <div className={`p-5 rounded-xl border ${isHigh ? 'bg-danger/5 border-danger/20' : 'bg-warning/5 border-warning/20'} relative overflow-hidden group`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <MapPin size={16} className={isHigh ? 'text-danger' : 'text-warning'} />
                        {forecast.zone}, {forecast.city}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{new Date(forecast.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isHigh ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                    {forecast.riskLevel} RISK
                </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
                {forecast.alerts.map((alert, i) => {
                    const Icon = alert.type.includes('rain') ? CloudRain : alert.type.includes('heat') ? Thermometer : Wind;
                    return (
                        <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${alert.severity === 'high' ? 'bg-white/[0.05] border-danger/30 text-slate-200' : 'bg-white/[0.05] border-warning/30 text-slate-200'
                            }`}>
                            <Icon size={14} className={alert.severity === 'high' ? 'text-danger' : 'text-warning'} />
                            {alert.message}
                        </div>
                    );
                })}
            </div>

            <div className="pt-4 border-t border-white/[0.06]">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Notification Preview</div>
                <div className="p-3 bg-dark-900 rounded-lg border border-white/5 font-mono text-sm text-slate-300">
                    {forecast.workerMessage}
                </div>
            </div>
        </div>
    );
}
