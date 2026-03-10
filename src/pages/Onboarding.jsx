import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, ChevronRight, ChevronLeft, MapPin, Clock,
    IndianRupee, Smartphone, User, Zap, CheckCircle2
} from 'lucide-react';

const PLATFORMS = ['Zomato', 'Swiggy', 'Zepto', 'Amazon', 'Blinkit', 'BigBasket', 'Dunzo'];

const platformEmojis = {
    Zomato: '🍲', Swiggy: '🛵', Zepto: '⚡', Amazon: '📦',
    Blinkit: '🛒', BigBasket: '🥬', Dunzo: '🏃'
};

export default function Onboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [cities, setCities] = useState([]);
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '',
        platform: '', city: '', zoneId: '',
        avgDailyHours: 8, avgDailyEarnings: 600
    });
    const [riskResult, setRiskResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedCity, setSelectedCity] = useState(null);

    useEffect(() => {
        fetch('/api/cities').then(r => r.json()).then(d => setCities(d.cities)).catch(() => { });
    }, []);

    const update = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/workers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            setRiskResult(data);
            setStep(5);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const steps = [
        { title: 'Personal Info', icon: User },
        { title: 'Platform', icon: Smartphone },
        { title: 'Location', icon: MapPin },
        { title: 'Earnings', icon: IndianRupee },
        { title: 'Review', icon: CheckCircle2 },
    ];

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/8 rounded-full blur-3xl" />
            </div>

            {/* Logo */}
            <div className="relative z-10 mb-8 text-center animate-fade-in">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-2xl gradient-india flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                        G
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-white">
                    GigGuard<span className="text-gradient">AI</span>
                </h1>
                <p className="text-slate-400 mt-1 text-sm">Parametric Income Protection for Gig Workers</p>
            </div>

            {/* Step indicator */}
            {step < 5 && (
                <div className="relative z-10 flex items-center gap-2 mb-8">
                    {steps.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                ${i < step ? 'bg-success text-white' : i === step ? 'gradient-primary text-white shadow-lg shadow-primary/30' : 'bg-white/[0.06] text-slate-500'}
              `}>
                                {i < step ? '✓' : i + 1}
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-8 h-0.5 ${i < step ? 'bg-success' : 'bg-white/10'} transition-all`} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Form card */}
            <div className="relative z-10 w-full max-w-md glass p-6 rounded-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>

                {/* Step 0: Personal Info */}
                {step === 0 && (
                    <div className="space-y-5">
                        <div className="text-center mb-6">
                            <User className="mx-auto mb-2 text-primary-light" size={28} />
                            <h2 className="text-xl font-bold text-white">Welcome, Partner!</h2>
                            <p className="text-sm text-slate-400 mt-1">Tell us about yourself</p>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => update('name', e.target.value)}
                                placeholder="e.g. Rajesh Kumar"
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => update('phone', e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Email (optional)</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => update('email', e.target.value)}
                                placeholder="rajesh@gmail.com"
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                )}

                {/* Step 1: Platform */}
                {step === 1 && (
                    <div className="space-y-5">
                        <div className="text-center mb-6">
                            <Smartphone className="mx-auto mb-2 text-primary-light" size={28} />
                            <h2 className="text-xl font-bold text-white">Choose Your Platform</h2>
                            <p className="text-sm text-slate-400 mt-1">Which app do you deliver for?</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {PLATFORMS.map(p => (
                                <button
                                    key={p}
                                    onClick={() => update('platform', p)}
                                    className={`
                    p-4 rounded-xl border text-left transition-all duration-200
                    ${formData.platform === p
                                            ? 'border-primary/50 bg-primary/10 shadow-lg shadow-primary/10'
                                            : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
                                        }
                  `}
                                >
                                    <span className="text-2xl">{platformEmojis[p]}</span>
                                    <div className="mt-2 text-sm font-semibold text-white">{p}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Location */}
                {step === 2 && (
                    <div className="space-y-5">
                        <div className="text-center mb-6">
                            <MapPin className="mx-auto mb-2 text-primary-light" size={28} />
                            <h2 className="text-xl font-bold text-white">Your Operating Area</h2>
                            <p className="text-sm text-slate-400 mt-1">Select your city and zone</p>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-2 block">City</label>
                            <div className="grid grid-cols-2 gap-2">
                                {cities.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            update('city', c.name);
                                            setSelectedCity(c);
                                            update('zoneId', c.zones[0]?.id || '');
                                        }}
                                        className={`
                      p-3 rounded-xl border text-sm font-medium transition-all
                      ${formData.city === c.name
                                                ? 'border-primary/50 bg-primary/10 text-primary-light'
                                                : 'border-white/[0.06] bg-white/[0.02] text-slate-300 hover:bg-white/[0.04]'
                                            }
                    `}
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedCity && (
                            <div className="animate-fade-in">
                                <label className="text-xs text-slate-400 mb-2 block">Zone</label>
                                <div className="space-y-2">
                                    {selectedCity.zones.map(z => (
                                        <button
                                            key={z.id}
                                            onClick={() => update('zoneId', z.id)}
                                            className={`
                        w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all
                        ${formData.zoneId === z.id
                                                    ? 'border-primary/50 bg-primary/10'
                                                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                                                }
                      `}
                                        >
                                            <div>
                                                <div className="text-sm font-medium text-white">{z.name}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">Flood zone: {z.floodProne ? 'Yes ⚠️' : 'No'}</div>
                                            </div>
                                            <span className={`
                        text-xs px-2 py-0.5 rounded-full font-semibold
                        ${z.riskLevel === 'high' ? 'bg-danger/20 text-danger' : z.riskLevel === 'medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}
                      `}>
                                                {z.riskLevel}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Earnings */}
                {step === 3 && (
                    <div className="space-y-5">
                        <div className="text-center mb-6">
                            <IndianRupee className="mx-auto mb-2 text-primary-light" size={28} />
                            <h2 className="text-xl font-bold text-white">Your Earnings</h2>
                            <p className="text-sm text-slate-400 mt-1">Help us calculate your coverage</p>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Average Daily Working Hours</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="2"
                                    max="14"
                                    value={formData.avgDailyHours}
                                    onChange={e => update('avgDailyHours', Number(e.target.value))}
                                    className="flex-1 accent-primary"
                                />
                                <span className="text-2xl font-bold text-white w-16 text-center">{formData.avgDailyHours}h</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Average Daily Earnings (₹)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="200"
                                    max="2000"
                                    step="50"
                                    value={formData.avgDailyEarnings}
                                    onChange={e => update('avgDailyEarnings', Number(e.target.value))}
                                    className="flex-1 accent-primary"
                                />
                                <span className="text-2xl font-bold text-white w-20 text-center">₹{formData.avgDailyEarnings}</span>
                            </div>
                        </div>
                        <div className="glass p-4 rounded-xl mt-4">
                            <div className="text-xs text-slate-400 mb-1">Weekly Earnings Estimate</div>
                            <div className="text-2xl font-bold text-gradient">₹{(formData.avgDailyEarnings * 7).toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <CheckCircle2 className="mx-auto mb-2 text-success" size={28} />
                            <h2 className="text-xl font-bold text-white">Review & Confirm</h2>
                            <p className="text-sm text-slate-400 mt-1">Everything look correct?</p>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Name', value: formData.name || '-' },
                                { label: 'Phone', value: formData.phone || '-' },
                                { label: 'Platform', value: formData.platform || '-' },
                                { label: 'City / Zone', value: `${formData.city} / ${selectedCity?.zones.find(z => z.id === formData.zoneId)?.name || '-'}` },
                                { label: 'Daily Hours', value: `${formData.avgDailyHours} hours` },
                                { label: 'Daily Earnings', value: `₹${formData.avgDailyEarnings}` },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                                    <span className="text-xs text-slate-400">{item.label}</span>
                                    <span className="text-sm font-medium text-white">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 5: Success / Risk Profile */}
                {step === 5 && riskResult && (
                    <div className="text-center space-y-5 animate-fade-in">
                        <div className="w-20 h-20 rounded-full gradient-india mx-auto flex items-center justify-center animate-pulse-glow">
                            <Shield className="text-white" size={36} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">You're Protected! 🎉</h2>
                        <p className="text-sm text-slate-400">Your AI risk profile has been generated</p>

                        <div className="grid grid-cols-3 gap-3 mt-6">
                            <div className="glass p-3 rounded-xl">
                                <div className="text-xs text-slate-400 mb-1">Weekly Premium</div>
                                <div className="text-xl font-bold text-gradient">₹{riskResult.riskAssessment?.weeklyPremium || riskResult.policy?.weeklyPremium}</div>
                            </div>
                            <div className="glass p-3 rounded-xl">
                                <div className="text-xs text-slate-400 mb-1">Risk Score</div>
                                <div className="text-xl font-bold text-warning">{riskResult.riskAssessment?.riskScore || riskResult.policy?.riskScore}/100</div>
                            </div>
                            <div className="glass p-3 rounded-xl">
                                <div className="text-xs text-slate-400 mb-1">Coverage</div>
                                <div className="text-xl font-bold text-success">₹{(riskResult.riskAssessment?.coverageLimit || riskResult.policy?.coverageLimit || 0).toLocaleString('en-IN')}</div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full mt-4 py-3 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98]"
                        >
                            Go to Dashboard →
                        </button>
                    </div>
                )}

                {/* Navigation buttons */}
                {step < 5 && (
                    <div className="flex gap-3 mt-8">
                        {step > 0 && (
                            <button
                                onClick={() => setStep(s => s - 1)}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-medium text-sm hover:bg-white/[0.04] transition-all flex items-center justify-center gap-2"
                            >
                                <ChevronLeft size={16} /> Back
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (step === 4) handleSubmit();
                                else setStep(s => s + 1);
                            }}
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : step === 4 ? (
                                <>Generate Risk Profile <Zap size={16} /></>
                            ) : (
                                <>Next <ChevronRight size={16} /></>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <p className="relative z-10 text-xs text-slate-500 mt-6">
                🔒 Your data is encrypted and never shared. Income protection only.
            </p>
        </div>
    );
}
