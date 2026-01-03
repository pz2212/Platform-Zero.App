
import React, { useState, useEffect } from 'react';
import { Truck, Package, CheckCircle2, X, MapPin, Sprout, Building2, Bell, ShieldCheck, ShoppingCart, Info, Check } from 'lucide-react';
import { AppNotification, User, UserRole } from '../types';

interface LiveActivityProps {
  notification: AppNotification | null;
  user: User;
  onClose: () => void;
}

export const LiveActivity: React.FC<LiveActivityProps> = ({ notification, user, onClose }) => {
  const [timer, setTimer] = useState("15:00");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timeout = setTimeout(() => setIsVisible(false), 12000);
      return () => clearTimeout(timeout);
    } else {
      setIsVisible(false);
    }
  }, [notification]);

  if (!notification || !isVisible) return null;

  const isPriceRequest = notification.type === 'PRICE_REQUEST';
  
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[95%] max-w-[420px] animate-in slide-in-from-top-20 duration-700 ease-out">
      <div className="bg-[#0B1221] text-white rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border-4 border-white/10 p-8 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
           <TrendingUp size={240} className="text-emerald-500"/>
        </div>

        {/* Status Header */}
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-2xl shadow-emerald-500/40 border-2 border-white/20">
                PZ
             </div>
             <div>
                <span className="block text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] leading-none">
                    {isPriceRequest ? 'Procurement Lead' : 'Live Update'}
                </span>
                <span className="block text-xl font-black text-white tracking-tight mt-1">
                    Market Intelligence
                </span>
             </div>
          </div>
          <button onClick={() => setIsVisible(false)} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full border border-white/5">
            <X size={20}/>
          </button>
        </div>

        {/* Progress Visualization */}
        <div className="flex items-center justify-between px-2 mb-8 relative z-10">
            <div className="text-center">
                <p className="text-3xl font-black tracking-tighter text-white">PZ</p>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Source</p>
            </div>

            <div className="flex-1 flex flex-col items-center px-6 relative">
                 <div className="w-full h-1 bg-slate-800 rounded-full relative overflow-hidden">
                    <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 to-indigo-500 w-1/2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                 </div>
                 <div className="absolute top-[-10px] left-[45%] animate-bounce duration-1000">
                    <Truck size={18} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                 </div>
                 <span className="text-[10px] font-black text-indigo-400 mt-4 uppercase tracking-[0.2em] animate-pulse">Dispatched</span>
            </div>

            <div className="text-center">
                <p className="text-3xl font-black tracking-tighter text-white">ETA 12m</p>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Arrival</p>
            </div>
        </div>

        {/* Content Box */}
        <div className="bg-white/5 backdrop-blur-md rounded-[1.75rem] p-6 border-2 border-white/5 mb-8 flex items-center justify-between relative z-10 group/box hover:bg-white/10 transition-all">
            <div className="flex flex-col flex-1 mr-4">
                <p className="text-lg font-black text-white tracking-tight leading-tight group-hover/box:text-emerald-400 transition-colors">{notification.title}</p>
                <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed">{notification.message}</p>
            </div>
            <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 border-2 border-white/20 shrink-0 transform group-hover/box:rotate-12 transition-transform">
                <Check size={24} strokeWidth={4} className="text-white" />
            </div>
        </div>

        {/* Interactive Footer */}
        <div className="flex gap-3 relative z-10">
            <button 
              onClick={() => setIsVisible(false)}
              className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all border-2 border-white/5"
            >
                Dismiss
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className="flex-[2] py-5 bg-white text-slate-950 hover:bg-emerald-400 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 group/btn"
            >
                View Dashboard <ArrowRight size={14} className="inline ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </button>
        </div>

      </div>
    </div>
  );
};

const TrendingUp = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);

const ArrowRight = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
