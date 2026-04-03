import { useState } from 'react';
import { Calculator, Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Zap, IndianRupee, Info, ChevronDown } from 'lucide-react';
import { getStore, getCurrentRider, PLANS, CITIES, calculateWeeklyPremium, calculateRiskScore } from '../data/store';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PremiumEngine() {
  const rider = getCurrentRider();
  const [selectedPlan, setSelectedPlan] = useState(rider ? (getStore().policies.find(p => p.riderId === rider.id)?.planId || 'weather') : 'weather');
  const [, setTick] = useState(0);
  const [showExplainer, setShowExplainer] = useState(false);

  const premiumResult = rider ? calculateWeeklyPremium(rider, selectedPlan) : null;
  const riskScore = rider ? calculateRiskScore(rider) : 0;

  // Premium trend (mock last 8 weeks)
  const trendData = [
    { week: 'W1', premium: premiumResult ? premiumResult.finalPremium + 4 : 49 },
    { week: 'W2', premium: premiumResult ? premiumResult.finalPremium + 2 : 47 },
    { week: 'W3', premium: premiumResult ? premiumResult.finalPremium + 6 : 51 },
    { week: 'W4', premium: premiumResult ? premiumResult.finalPremium - 1 : 44 },
    { week: 'W5', premium: premiumResult ? premiumResult.finalPremium + 3 : 48 },
    { week: 'W6', premium: premiumResult ? premiumResult.finalPremium : 45 },
    { week: 'W7', premium: premiumResult ? premiumResult.finalPremium - 2 : 43 },
    { week: 'W8', premium: premiumResult ? premiumResult.finalPremium : 45 },
  ];

  // Disruption probability (mock)
  const disruptionProb = riskScore > 60 ? 72 : riskScore > 35 ? 45 : 18;

  return (
    <div className="space-y-6 max-w-5xl page-enter">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Calculator size={20} className="text-primary-light" /> AI Premium Engine
        </h1>
        <p className="text-sm text-slate-400 mt-1">Dynamic weekly premium calculation powered by risk intelligence</p>
      </div>

      {/* Plan selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {PLANS.map(p => (
          <button key={p.id} onClick={() => setSelectedPlan(p.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all ${
              selectedPlan === p.id ? 'border-primary/40 bg-primary/10 text-primary-light' : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]'
            }`}>
            <span>{p.emoji}</span> {p.name}
          </button>
        ))}
      </div>

      {premiumResult && (
        <>
          {/* Main Premium Card */}
          <div className="glass-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[60px]" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Brain size={24} className="text-white" />
              </div>
              <div>
                <div className="text-xs text-slate-400">AI-Calculated Weekly Premium</div>
                <div className="text-sm text-slate-500">{premiumResult.planName}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Base Premium</div>
                <div className="text-2xl font-bold text-slate-300">₹{premiumResult.basePremium}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Risk Adjustments</div>
                <div className="text-2xl font-bold text-warning">
                  {premiumResult.finalPremium > premiumResult.basePremium ? '+' : ''}₹{premiumResult.finalPremium - premiumResult.basePremium}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Final Premium</div>
                <div className="text-3xl font-bold text-gradient">₹{premiumResult.finalPremium}</div>
                <div className="text-[10px] text-slate-500">per week</div>
              </div>
            </div>

            {/* Risk Score Dial */}
            <div className="flex justify-center mb-5">
              <div className="relative w-36 h-20 overflow-hidden">
                <svg viewBox="0 0 200 100" className="w-full">
                  <path d="M 20 95 A 80 80 0 0 1 180 95" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 20 95 A 80 80 0 0 1 180 95" fill="none"
                    stroke={riskScore > 60 ? '#ef4444' : riskScore > 35 ? '#f59e0b' : '#22c55e'}
                    strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${(riskScore / 100) * 251} 251`}
                    style={{ transition: 'stroke-dasharray 1s ease' }} />
                  <text x="100" y="78" textAnchor="middle" fill="#e2e8f0" fontSize="28" fontWeight="800">{riskScore}</text>
                  <text x="100" y="95" textAnchor="middle" fill="#64748b" fontSize="11">Risk Score</text>
                </svg>
              </div>
            </div>

            <div className="flex justify-center gap-4 text-xs">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success" /> Low (0-35)</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-warning" /> Medium (36-60)</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-danger" /> High (61-100)</div>
            </div>
          </div>

          {/* Premium Breakdown */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="glass-card">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <IndianRupee size={14} className="text-primary-light" /> Premium Breakdown
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-sm text-slate-300">Base Premium</span>
                  <span className="text-sm font-bold text-white">₹{premiumResult.basePremium}</span>
                </div>
                {premiumResult.factors.map((f, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      {f.amount > 0 ? <TrendingUp size={13} className="text-danger" /> : <TrendingDown size={13} className="text-success" />}
                      <span className="text-sm text-slate-300">{f.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${f.amount > 0 ? 'text-danger' : 'text-success'}`}>
                      {f.amount > 0 ? '+' : ''}₹{f.amount}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 rounded-xl bg-primary/5 border border-primary/15">
                  <span className="text-sm font-bold text-white">Final Weekly Premium</span>
                  <span className="text-lg font-bold text-gradient">₹{premiumResult.finalPremium}</span>
                </div>
              </div>
            </div>

            {/* Hyper-local Risk Factors */}
            <div className="glass-card">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={14} className="text-warning" /> Hyper-Local Risk Factors
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Zone Weather Risk', value: rider?.zone?.avgRainfall > 70 ? 'High' : rider?.zone?.avgRainfall > 50 ? 'Medium' : 'Low', detail: `Avg Rainfall: ${rider?.zone?.avgRainfall || 0}mm`, risk: rider?.zone?.avgRainfall > 70 ? 'high' : rider?.zone?.avgRainfall > 50 ? 'medium' : 'low' },
                  { label: 'Flood Risk', value: rider?.zone?.floodProne ? 'High' : 'Low', detail: `Flood-prone zone: ${rider?.zone?.floodProne ? 'Yes' : 'No'}`, risk: rider?.zone?.floodProne ? 'high' : 'low' },
                  { label: 'AQI Exposure', value: (rider?.zone?.avgAQI || 0) > 300 ? 'Severe' : (rider?.zone?.avgAQI || 0) > 200 ? 'High' : 'Moderate', detail: `Average AQI: ${rider?.zone?.avgAQI || 0}`, risk: (rider?.zone?.avgAQI || 0) > 300 ? 'high' : (rider?.zone?.avgAQI || 0) > 200 ? 'medium' : 'low' },
                  { label: 'Heat Exposure', value: `${rider?.zone?.avgTemp || 35}°C avg`, detail: `Threshold: 44°C`, risk: (rider?.zone?.avgTemp || 35) > 42 ? 'high' : (rider?.zone?.avgTemp || 35) > 38 ? 'medium' : 'low' },
                  { label: 'Working Hours', value: `${rider?.avgDailyHours || 8}h/day`, detail: 'Extended hours = higher exposure', risk: (rider?.avgDailyHours || 8) > 10 ? 'medium' : 'low' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div>
                      <div className="text-xs font-medium text-white">{item.label}</div>
                      <div className="text-[10px] text-slate-500">{item.detail}</div>
                    </div>
                    <span className={`badge ${item.risk === 'high' ? 'badge-danger' : item.risk === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Disruption probability */}
              <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Predicted Disruption Probability</span>
                  <span className={`text-lg font-bold ${disruptionProb > 60 ? 'text-danger' : disruptionProb > 35 ? 'text-warning' : 'text-success'}`}>{disruptionProb}%</span>
                </div>
                <div className="risk-meter">
                  <div className="risk-meter-fill" style={{
                    width: `${disruptionProb}%`,
                    background: disruptionProb > 60 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : disruptionProb > 35 ? 'linear-gradient(90deg, #22c55e, #f59e0b)' : 'linear-gradient(90deg, #22c55e, #14b8a6)',
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Premium Trend + AI Insight */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass-card">
              <h3 className="text-sm font-semibold text-white mb-4">Weekly Premium Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="premGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    contentStyle={{ background: '#0f1d32', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                    formatter={v => [`₹${v}`, 'Premium']}
                  />
                  <Area type="monotone" dataKey="premium" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#premGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* AI Insight Card */}
            <div className="glass-card">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Zap size={14} className="text-primary-light" /> AI Recommendations
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl notification-card success">
                  <div className="text-xs font-semibold text-white mb-1">Recommended for next week</div>
                  <div className="text-[11px] text-slate-400">
                    Based on weather forecasts and your work pattern, we recommend {premiumResult.planName} for optimal protection.
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-xs text-slate-300 flex items-center gap-1"><Info size={11} /> Confidence Level</div>
                  <div className="text-sm font-bold text-white mt-1">{premiumResult.confidence}</div>
                </div>
              </div>

              <button onClick={() => setShowExplainer(!showExplainer)} className="w-full mt-3 btn-ghost py-2 text-xs justify-center">
                <Info size={12} /> Why did my premium change?
              </button>
              {showExplainer && (
                <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs text-slate-400 animate-fade-in">
                  Your premium is dynamically calculated based on {premiumResult.factors.length} risk factors including zone weather history, flood risk, AQI levels, and your delivery pattern. Each factor adds or removes from the base ₹{premiumResult.basePremium}/week premium.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
