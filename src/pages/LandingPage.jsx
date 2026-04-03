import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Zap, CloudRain, IndianRupee, CheckCircle2,
  ChevronRight, Smartphone, Globe, TrendingUp,
  Clock, ArrowRight, Droplets, Thermometer, Wind, Users, Star
} from 'lucide-react';

// Animated counter hook
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return [count, ref];
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const [riders, ridersRef] = useCounter(18000);
  const [claims, claimsRef] = useCounter(6200);
  const [payouts, payoutsRef] = useCounter(45);
  const [cities, citiesRef] = useCounter(12);

  const features = [
    { icon: Zap, title: 'Zero-Touch Claims', desc: 'Disruptions detected → claims auto-created → payout in 1 tap. No forms, no calls.', color: '#0ea5e9', delay: '0s' },
    { icon: CloudRain, title: 'Parametric Triggers', desc: 'Rain, flood, heat, AQI — real-time monitoring triggers instant income protection.', color: '#3b82f6', delay: '0.1s' },
    { icon: IndianRupee, title: 'Dynamic Premiums', desc: 'AI calculates weekly premiums from ₹29 based on zone risk, weather, and work pattern.', color: '#14b8a6', delay: '0.2s' },
    { icon: Shield, title: 'Fraud-Aware Engine', desc: 'Location, time, frequency pattern analysis ensures only legitimate claims proceed.', color: '#6366f1', delay: '0.3s' },
  ];

  const disruptions = [
    { icon: '🌧️', label: 'Heavy Rain', text: 'Lost deliveries due to rain' },
    { icon: '🌊', label: 'Flooding', text: 'Waterlogged roads & routes' },
    { icon: '🔥', label: 'Heatwave', text: 'Unsafe working temperatures' },
    { icon: '💨', label: 'Pollution', text: 'High AQI shutdowns' },
    { icon: '🚧', label: 'Zone Closure', text: 'Curfews & closures' },
    { icon: '📱', label: 'App Outage', text: 'Platform downtime' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.04] bg-dark-900/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/25">
              FC
            </div>
            <span className="text-lg font-bold text-white tracking-tight">FlexCover</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn-ghost py-2 px-4 text-xs">
              Dashboard
            </button>
            <button onClick={() => navigate('/onboarding')} className="btn-primary py-2.5 px-5 text-xs">
              Start Now <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/6 rounded-full blur-[140px]"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }} />
          <div className="absolute bottom-1/3 right-1/4 w-[450px] h-[450px] bg-secondary/5 rounded-full blur-[120px]"
            style={{ transform: `translateY(${scrollY * -0.1}px)` }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/4 rounded-full blur-[100px] animate-float" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-6 animate-fade-in">
            <Zap size={12} className="text-primary" />
            <span className="text-xs text-primary-light font-medium">AI-Powered Income Protection for Gig Workers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 animate-fade-in"
            style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
            Your Deliveries Stopped?
            <br />
            <span className="text-gradient">Your Income Doesn't.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in"
            style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
            Weekly income protection for India's delivery partners.
            Rain, flood, heatwave — we detect it, you confirm it, money hits your UPI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 animate-fade-in"
            style={{ animationDelay: '0.45s', animationFillMode: 'backwards' }}>
            <button onClick={() => navigate('/onboarding')}
              className="btn-primary py-4 px-8 text-base font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40">
              Get Protected — ₹29/week <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/dashboard')}
              className="btn-ghost py-4 px-8 text-base font-medium">
              <Globe size={18} /> Explore Dashboard
            </button>
          </div>

          {/* Disruption pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in"
            style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
            {disruptions.map(d => (
              <div key={d.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs text-slate-300">
                <span>{d.icon}</span> {d.label}
              </div>
            ))}
          </div>

          {/* Hero visual: Mock phone UI */}
          <div className="relative max-w-xs mx-auto animate-fade-in"
            style={{ animationDelay: '0.75s', animationFillMode: 'backwards' }}>
            <div className="absolute inset-0 gradient-primary rounded-[32px] blur-2xl opacity-15" />
            <div className="relative glass p-1.5 rounded-[28px] border-2 border-white/[0.08]">
              <div className="bg-dark-800 rounded-[24px] p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">RK</div>
                  <div>
                    <div className="text-xs font-bold text-white">Rajesh Kumar</div>
                    <div className="text-[9px] text-success flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-success" /> Protected</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-primary/8 border border-primary/15">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={14} className="text-primary-light" />
                    <span className="text-[10px] font-bold text-white">Auto-Claim Available</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Heavy Rain detected in your zone</div>
                  <div className="text-sm font-bold text-primary-light mt-1">₹480 payout ready</div>
                </div>
                <button className="w-full py-2 rounded-xl gradient-primary text-white text-xs font-bold animate-pulse-glow">
                  ✓ Confirm & Receive — 1 Tap
                </button>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-white/[0.02]">
                    <div className="text-[9px] text-slate-500">This Week</div>
                    <div className="text-xs font-bold text-success">₹1,720</div>
                    <div className="text-[8px] text-slate-500">protected</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02]">
                    <div className="text-[9px] text-slate-500">Premium</div>
                    <div className="text-xs font-bold text-white">₹45/wk</div>
                    <div className="text-[8px] text-slate-500">paid</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { ref: ridersRef, value: riders, suffix: '+', label: 'Registered Riders', icon: Users },
            { ref: claimsRef, value: claims, suffix: '+', label: 'Claims Processed', icon: CheckCircle2 },
            { ref: payoutsRef, value: payouts, suffix: 'L+', label: 'Total Payouts (₹)', icon: IndianRupee },
            { ref: citiesRef, value: cities, suffix: '', label: 'Cities Covered', icon: MapPin },
          ].map((s, i) => (
            <div key={i} ref={s.ref} className="glass-card p-6 text-center">
              <s.icon size={24} className="text-primary-light mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-white">{s.value.toLocaleString('en-IN')}{s.suffix}</div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">How FlexCover Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">From disruption to payout in under 60 seconds. Fully automated.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Register & Choose Plan', desc: 'Enter your details, pick a weekly plan starting ₹29.', icon: Smartphone, color: '#0ea5e9' },
              { step: '02', title: 'AI Monitors Your Zone', desc: 'We track rain, heat, AQI, floods in your delivery area 24/7.', icon: Globe, color: '#14b8a6' },
              { step: '03', title: 'Disruption Triggers Claim', desc: 'When threshold is breached, your claim is auto-generated.', icon: CloudRain, color: '#6366f1' },
              { step: '04', title: 'Confirm & Get Paid', desc: 'One tap to confirm. Payout to your UPI within minutes.', icon: IndianRupee, color: '#22c55e' },
            ].map((item, i) => (
              <div key={i} className="glass-card text-center p-6 group hover:border-primary/20">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: item.color + '15' }}>
                  <item.icon size={28} style={{ color: item.color }} />
                </div>
                <div className="text-xs font-bold text-primary-light mb-2">STEP {item.step}</div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Built Different</h2>
            <p className="text-slate-400">Not traditional insurance. AI-powered income protection.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="glass-card p-6 flex gap-4 group animate-fade-in"
                style={{ animationDelay: f.delay, animationFillMode: 'backwards' }}>
                <div className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: f.color + '15' }}>
                  <f.icon size={24} style={{ color: f.color }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disruptions Covered */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">We Cover These Disruptions</h2>
          <p className="text-slate-400 mb-10">Loss of income from external disruptions that stop your deliveries.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {disruptions.map(d => (
              <div key={d.label} className="glass-card p-4 text-center hover:border-primary/15 group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{d.icon}</div>
                <div className="text-sm font-bold text-white mb-1">{d.label}</div>
                <div className="text-[10px] text-slate-500">{d.text}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-xs text-slate-500">
            ⚠️ We cover <strong className="text-white">loss of income only</strong>. No health, life, accident, or vehicle insurance.
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="glass-card p-10 relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-5" />
            <h2 className="text-3xl font-bold text-white mb-3 relative z-10">Start Protecting Your Income</h2>
            <p className="text-slate-400 mb-8 relative z-10">Join thousands of gig delivery partners across India.</p>
            <button onClick={() => navigate('/onboarding')}
              className="relative z-10 btn-primary py-4 px-10 text-lg font-bold shadow-xl shadow-primary/30">
              Register Now — ₹29/week <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-xs">FC</div>
            <span className="text-sm font-bold text-white">FlexCover</span>
          </div>
          <p className="text-xs text-slate-500 mb-2">AI-Powered Parametric Income Protection for India's Gig Economy</p>
          <p className="text-[10px] text-slate-600">Income loss protection only. No health/life/accident/vehicle coverage. Weekly premiums.</p>
          <p className="text-[10px] text-slate-700 mt-3">© 2026 FlexCover AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function MapPin(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  );
}
