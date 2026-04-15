import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck, 
  Smartphone, IndianRupee, Wifi, Zap 
} from 'lucide-react';

export default function UPISimulator({ amount, riderName, onExhibit, onClose }) {
  const [step, setStep] = useState('init'); // init, processing, success, fail
  const [txId, setTxId] = useState('');

  useEffect(() => {
    if (step === 'processing') {
      const timer = setTimeout(() => {
        setTxId(`UPI${Math.floor(Math.random() * 9000000000) + 1000000000}`);
        setStep('success');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleFinish = () => {
    if (onExhibit) onExhibit(txId);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm glass-card border-none bg-[#111] overflow-hidden shadow-2xl shadow-primary/20">
        {/* Header */}
        <div className="bg-[#1a1a1a] p-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-widest">FLEXPAY UPI</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi size={14} className="text-success" />
            <span className="text-[10px] font-bold text-slate-500">SECURE</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col items-center text-center">
          {step === 'init' && (
            <div className="animate-fade-in w-full">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                <IndianRupee size={30} className="text-primary-light" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Instant Payout Request</h2>
              <p className="text-sm text-slate-400 mb-8">
                Transferring <span className="text-white font-bold">₹{amount}</span> to <br/>
                <span className="text-primary-light font-medium">{riderName}</span>
              </p>
              <button 
                onClick={() => setStep('processing')}
                className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-2 group"
              >
                Authenticate & Pay <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="animate-fade-in py-8">
              <div className="relative">
                <Loader2 size={60} className="text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Smartphone size={24} className="text-white opacity-50" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mt-8 mb-2">Verifying with Bank...</h2>
              <p className="text-sm text-slate-400">Please do not refresh or close the window.</p>
              
              <div className="mt-8 flex gap-1 justify-center">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="animate-scale-in w-full">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6 mx-auto border-2 border-success/20">
                <CheckCircle2 size={40} className="text-success" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Money Credited!</h2>
              <div className="text-3xl font-bold text-success mb-6">₹{amount}</div>
              
              <div className="bg-white/5 rounded-xl p-4 mb-8 text-left space-y-2 border border-white/5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500 uppercase">Transaction ID</span>
                  <span className="text-white font-mono">{txId}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500 uppercase">Status</span>
                  <span className="text-success font-bold">SUCCESS</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500 uppercase">Time</span>
                  <span className="text-white">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              <button 
                onClick={handleFinish}
                className="w-full py-4 rounded-xl bg-success text-white text-base font-bold shadow-lg shadow-success/20 active:scale-[0.98] transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-black/40 p-3 flex justify-center gap-6 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-slate-500" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">PCI DSS Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="text-[9px] font-bold uppercase tracking-tighter font-mono">256-Bit SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
