import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, ChevronRight, ChevronLeft, MapPin, Clock,
  IndianRupee, Smartphone, User, Zap, CheckCircle2,
  Bike, Phone, Globe, AlertCircle, Upload, Heart,
  UserCheck, Fingerprint
} from 'lucide-react';
import {
  PLATFORMS, DELIVERY_TYPES, VEHICLE_TYPES, LANGUAGES, CITIES, PLANS,
  addRider, addPolicy, calculateRiskScore, calculateWeeklyPremium
} from '../data/store';

const platformEmojis = {
  Swiggy: '🛵', Zomato: '🍲', Zepto: '⚡', Blinkit: '🛒', Instamart: '🛍️', Other: '📦'
};

const cityList = Object.values(CITIES);

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [animating, setAnimating] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', age: '', gender: 'Male',
    platform: '', deliveryType: '', city: '', zone: null,
    language: 'Hindi', avgDailyHours: 8, avgWeeklyEarnings: 4200,
    vehicleType: 'Bike', upiId: '', emergencyContact: '',
    consentAutoMonitor: true,
  });

  const [selectedCity, setSelectedCity] = useState(null);
  const [riskProfile, setRiskProfile] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('weather');
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const goNext = () => {
    setAnimating(true);
    setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 200);
  };

  const goBack = () => {
    setAnimating(true);
    setTimeout(() => { setStep(s => s - 1); setAnimating(false); }, 200);
  };

  const handleOTP = () => { setOtpSent(true); setTimeout(() => setOtpValue('8472'), 800); };
  const verifyOTP = () => { if (otpValue.length === 4) { setOtpVerified(true); } };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      // Create risk profile
      const zone = form.zone || selectedCity?.zones[0];
      const riderData = {
        ...form,
        zone,
        avgDailyHours: Number(form.avgDailyHours),
        avgWeeklyEarnings: Number(form.avgWeeklyEarnings),
      };

      const rider = addRider(riderData);
      const riskScore = calculateRiskScore(rider);
      const premiumResult = calculateWeeklyPremium(rider, selectedPlan);
      const policy = addPolicy(rider.id, selectedPlan);

      setRiskProfile({
        riderId: rider.id,
        riskScore,
        premium: premiumResult,
        policy,
        persona: form.deliveryType === 'Food Delivery' ? 'Food Delivery Partner' : 'Quick Commerce Partner',
        zoneRisk: zone?.riskLevel || 'medium',
      });

      setStep(7); // Success step
      setLoading(false);
    }, 1500);
  };

  const steps = [
    { title: 'Personal Info', icon: User },
    { title: 'Verify Phone', icon: Fingerprint },
    { title: 'Platform', icon: Smartphone },
    { title: 'Location', icon: MapPin },
    { title: 'Work Details', icon: Clock },
    { title: 'Payout & Safety', icon: IndianRupee },
    { title: 'Choose Plan', icon: Shield },
  ];

  const canProceed = () => {
    switch (step) {
      case 0: return form.name && form.phone && form.age;
      case 1: return otpVerified;
      case 2: return form.platform && form.deliveryType;
      case 3: return form.city && form.zone;
      case 4: return true;
      case 5: return form.upiId;
      case 6: return selectedPlan;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-start p-4 pt-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-secondary/6 rounded-full blur-[100px]" />
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-6 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/25">
            FC
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">FlexCover</h1>
        <p className="text-slate-400 mt-1 text-sm">Income Protection for Delivery Partners</p>
      </div>

      {/* Progress bar */}
      {step < 7 && (
        <div className="relative z-10 w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Step {step + 1} of {steps.length}</span>
            <span className="text-xs text-primary-light font-semibold">{steps[step]?.title}</span>
          </div>
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((s, i) => (
              <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                i < step ? 'bg-success text-white' : i === step ? 'gradient-primary text-white shadow-lg shadow-primary/30' : 'bg-white/[0.06] text-slate-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form card */}
      <div className={`relative z-10 w-full max-w-md glass p-6 rounded-2xl transition-all duration-300 ${animating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}>

        {/* Step 0: Personal Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="text-center mb-5">
              <User className="mx-auto mb-2 text-primary-light" size={28} />
              <h2 className="text-xl font-bold text-white">Welcome, Partner!</h2>
              <p className="text-sm text-slate-400 mt-1">Tell us about yourself</p>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Full Name *</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                placeholder="e.g. Rajesh Kumar" className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Phone Number *</label>
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                  placeholder="+91 98765 43210" className="input-field" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Age *</label>
                <input type="number" value={form.age} onChange={e => update('age', e.target.value)}
                  placeholder="28" className="input-field" min="18" max="65" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Gender</label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map(g => (
                  <button key={g} onClick={() => update('gender', g)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      form.gender === g ? 'border-primary/50 bg-primary/10 text-primary-light' : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]'
                    }`}>{g}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: OTP Verification */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center mb-5">
              <Fingerprint className="mx-auto mb-2 text-primary-light" size={28} />
              <h2 className="text-xl font-bold text-white">Verify Your Number</h2>
              <p className="text-sm text-slate-400 mt-1">We'll send a quick OTP to {form.phone || 'your phone'}</p>
            </div>
            {!otpSent ? (
              <button onClick={handleOTP} className="w-full btn-primary py-3 text-sm">
                <Phone size={16} /> Send OTP
              </button>
            ) : !otpVerified ? (
              <div className="space-y-4">
                <div className="flex gap-3 justify-center">
                  {[0, 1, 2, 3].map(i => (
                    <input key={i} type="text" maxLength="1" value={otpValue[i] || ''}
                      onChange={e => {
                        const val = otpValue.split('');
                        val[i] = e.target.value;
                        setOtpValue(val.join(''));
                      }}
                      className="w-14 h-14 text-center text-2xl font-bold input-field rounded-xl" />
                  ))}
                </div>
                <button onClick={verifyOTP} className="w-full btn-primary py-3 text-sm">Verify OTP</button>
                <p className="text-center text-xs text-slate-500">Demo: OTP auto-fills in 1 second</p>
              </div>
            ) : (
              <div className="text-center py-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={32} className="text-success" />
                </div>
                <p className="text-success font-semibold">Phone Verified! ✓</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Platform & Delivery Type */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center mb-5">
              <Smartphone className="mx-auto mb-2 text-primary-light" size={28} />
              <h2 className="text-xl font-bold text-white">Your Platform</h2>
              <p className="text-sm text-slate-400 mt-1">Which app do you deliver for?</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[...PLATFORMS, 'Other'].map(p => (
                <button key={p} onClick={() => update('platform', p)}
                  className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                    form.platform === p
                      ? 'border-primary/50 bg-primary/10 shadow-lg shadow-primary/10'
                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
                  }`}>
                  <span className="text-xl block mb-1">{platformEmojis[p] || '📦'}</span>
                  <div className="text-xs font-semibold text-white">{p}</div>
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Delivery Type</label>
              <div className="grid grid-cols-2 gap-2">
                {DELIVERY_TYPES.map(dt => (
                  <button key={dt} onClick={() => update('deliveryType', dt)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      form.deliveryType === dt
                        ? 'border-primary/50 bg-primary/10 text-primary-light'
                        : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]'
                    }`}>{dt}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-5">
              <MapPin className="mx-auto mb-2 text-primary-light" size={28} />
              <h2 className="text-xl font-bold text-white">Your Delivery Zone</h2>
              <p className="text-sm text-slate-400 mt-1">Select your city and work area</p>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">City</label>
              <div className="grid grid-cols-3 gap-2">
                {cityList.map(c => (
                  <button key={c.name} onClick={() => { update('city', c.name); setSelectedCity(c); update('zone', c.zones[0]); }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      form.city === c.name
                        ? 'border-primary/50 bg-primary/10 text-primary-light'
                        : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]'
                    }`}>{c.name}</button>
                ))}
              </div>
            </div>
            {selectedCity && (
              <div className="animate-fade-in">
                <label className="text-xs text-slate-400 mb-2 block">Delivery Zone</label>
                <div className="space-y-2">
                  {selectedCity.zones.map(z => (
                    <button key={z.id} onClick={() => update('zone', z)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        form.zone?.id === z.id
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}>
                      <div>
                        <div className="text-sm font-medium text-white">{z.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5 flex gap-3">
                          <span>Flood: {z.floodProne ? '⚠️ Yes' : '✅ No'}</span>
                          <span>AQI: {z.avgAQI}</span>
                        </div>
                      </div>
                      <span className={`badge ${z.riskLevel === 'high' ? 'badge-danger' : z.riskLevel === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                        {z.riskLevel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Preferred Language</label>
              <select value={form.language} onChange={e => update('language', e.target.value)} className="input-field">
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Work Details */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="text-center mb-5">
              <Clock className="mx-auto mb-2 text-primary-light" size={28} />
              <h2 className="text-xl font-bold text-white">Work Details</h2>
              <p className="text-sm text-slate-400 mt-1">Help us calculate your coverage</p>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Average Daily Working Hours</label>
              <div className="flex items-center gap-4">
                <input type="range" min="2" max="14" value={form.avgDailyHours}
                  onChange={e => update('avgDailyHours', Number(e.target.value))} className="flex-1" />
                <span className="text-2xl font-bold text-white w-14 text-center">{form.avgDailyHours}h</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Average Weekly Earnings (₹)</label>
              <div className="flex items-center gap-4">
                <input type="range" min="1500" max="12000" step="100" value={form.avgWeeklyEarnings}
                  onChange={e => update('avgWeeklyEarnings', Number(e.target.value))} className="flex-1" />
                <span className="text-xl font-bold text-white w-20 text-center">₹{form.avgWeeklyEarnings.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Vehicle Type</label>
              <div className="grid grid-cols-4 gap-2">
                {VEHICLE_TYPES.map(v => (
                  <button key={v} onClick={() => update('vehicleType', v)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                      form.vehicleType === v
                        ? 'border-primary/50 bg-primary/10 text-primary-light'
                        : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]'
                    }`}>{v === 'Bike' ? '🏍️' : v === 'Bicycle' ? '🚲' : v === 'EV' ? '⚡' : '🚶'} {v}</button>
                ))}
              </div>
            </div>
            <div className="glass p-4 rounded-xl">
              <div className="text-xs text-slate-400 mb-1">Estimated Income Protection</div>
              <div className="text-2xl font-bold text-gradient">₹{Math.round(form.avgWeeklyEarnings * 0.8).toLocaleString('en-IN')}/week</div>
              <div className="text-xs text-slate-500 mt-1">Up to 80% of your weekly earnings protected</div>
            </div>
          </div>
        )}

        {/* Step 5: Payout & Safety */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="text-center mb-5">
              <IndianRupee className="mx-auto mb-2 text-primary-light" size={28} />
              <h2 className="text-xl font-bold text-white">Payout & Safety</h2>
              <p className="text-sm text-slate-400 mt-1">How should we send your payouts?</p>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">UPI ID / Payout Method *</label>
              <input type="text" value={form.upiId} onChange={e => update('upiId', e.target.value)}
                placeholder="yourname@paytm" className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Emergency Contact</label>
              <input type="tel" value={form.emergencyContact} onChange={e => update('emergencyContact', e.target.value)}
                placeholder="+91 98765 00000" className="input-field" />
            </div>
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Upload size={18} className="text-slate-400" />
                <div>
                  <div className="text-sm text-white font-medium">ID Proof Upload (Optional)</div>
                  <div className="text-xs text-slate-500">Aadhar / PAN / Driving License</div>
                </div>
                <button className="ml-auto text-xs text-primary-light font-semibold px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/10 transition-all">
                  Upload
                </button>
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-white/[0.06] hover:bg-white/[0.02] transition-all">
              <input type="checkbox" checked={form.consentAutoMonitor}
                onChange={e => update('consentAutoMonitor', e.target.checked)}
                className="mt-1 accent-primary" />
              <div>
                <div className="text-sm text-white font-medium">Enable Automated Monitoring</div>
                <div className="text-xs text-slate-500 mt-0.5">Allow FlexCover to monitor weather, AQI, and platform status in your zone for automatic claim processing.</div>
              </div>
            </label>
          </div>
        )}

        {/* Step 6: Choose Plan */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Shield className="mx-auto mb-2 text-primary-light" size={28} />
              <h2 className="text-xl font-bold text-white">Choose Your Shield</h2>
              <p className="text-sm text-slate-400 mt-1">Select a weekly income protection plan</p>
            </div>
            <div className="space-y-3 max-h-[380px] overflow-auto pr-1">
              {PLANS.map(plan => {
                const premiumEst = plan.basePremium + (form.zone?.riskLevel === 'high' ? 8 : form.zone?.riskLevel === 'medium' ? 3 : 0);
                return (
                  <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selectedPlan === plan.id
                        ? 'border-primary/50 bg-primary/8 ring-1 ring-primary/20'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{plan.emoji}</span>
                        <div>
                          <div className="text-sm font-bold text-white">{plan.name}</div>
                          <div className="text-xs text-slate-500">{plan.description}</div>
                        </div>
                      </div>
                      {plan.popular && <span className="badge badge-info text-[9px]">Popular</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div>
                        <div className="text-lg font-bold text-gradient">₹{premiumEst}</div>
                        <div className="text-[10px] text-slate-500">/ week</div>
                      </div>
                      <div className="text-xs text-slate-400">Max ₹{plan.maxPayout.toLocaleString('en-IN')}/week</div>
                      <div className="text-xs text-slate-400">{plan.coverageHours}h coverage</div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {plan.coveredDisruptions.map(d => (
                        <span key={d} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.04]">{d}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 7: Success / Risk Profile */}
        {step === 7 && riskProfile && (
          <div className="text-center space-y-5 animate-fade-in">
            <div className="w-20 h-20 rounded-full gradient-primary mx-auto flex items-center justify-center shadow-lg shadow-primary/30">
              <Shield className="text-white" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-white">You're Protected! 🎉</h2>
            <p className="text-sm text-slate-400">Your income protection is now active</p>

            {/* Risk Profile Card */}
            <div className="glass p-5 rounded-xl text-left space-y-4">
              <h3 className="text-xs font-bold text-primary-light uppercase tracking-wider">Delivery Partner Risk Profile</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Rider ID', value: riskProfile.riderId.slice(0, 12) + '…' },
                  { label: 'Persona', value: riskProfile.persona },
                  { label: 'Risk Score', value: `${riskProfile.riskScore}/100`, color: riskProfile.riskScore > 60 ? 'text-danger' : riskProfile.riskScore > 35 ? 'text-warning' : 'text-success' },
                  { label: 'Zone Risk', value: riskProfile.zoneRisk, color: riskProfile.zoneRisk === 'high' ? 'text-danger' : riskProfile.zoneRisk === 'medium' ? 'text-warning' : 'text-success' },
                  { label: 'Weekly Plan', value: riskProfile.premium.planName },
                  { label: 'Weekly Premium', value: `₹${riskProfile.premium.finalPremium}` },
                  { label: 'Max Payout', value: `₹${riskProfile.premium.maxPayout.toLocaleString('en-IN')}/wk` },
                  { label: 'Protection', value: `₹${Math.round(form.avgWeeklyEarnings * 0.8).toLocaleString('en-IN')}/wk` },
                ].map((item, i) => (
                  <div key={i} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-[10px] text-slate-500 mb-0.5">{item.label}</div>
                    <div className={`text-sm font-bold ${item.color || 'text-white'}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Risk meter */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Base Risk Score</span>
                  <span className={riskProfile.riskScore > 60 ? 'text-danger' : riskProfile.riskScore > 35 ? 'text-warning' : 'text-success'}>
                    {riskProfile.riskScore}/100
                  </span>
                </div>
                <div className="risk-meter">
                  <div className="risk-meter-fill" style={{
                    width: `${riskProfile.riskScore}%`,
                    background: riskProfile.riskScore > 60 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : riskProfile.riskScore > 35 ? 'linear-gradient(90deg, #22c55e, #f59e0b)' : 'linear-gradient(90deg, #22c55e, #14b8a6)',
                  }} />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate('/dashboard')}
                className="flex-1 btn-primary py-3 text-sm">
                Go to Dashboard →
              </button>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        {step < 7 && (
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={goBack}
                className="flex-1 btn-ghost py-3 text-sm justify-center">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <button
              onClick={() => {
                if (step === 6) handleSubmit();
                else goNext();
              }}
              disabled={loading || !canProceed()}
              className="flex-1 btn-primary py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : step === 6 ? (
                <>Activate Protection <Zap size={16} /></>
              ) : (
                <>Next <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="relative z-10 text-xs text-slate-600 mt-6 text-center">
        🔒 Your data is encrypted. Income protection only — no health/accident/vehicle coverage.
      </p>
    </div>
  );
}
