
import React, { useState, useEffect } from 'react';
import { X, Bell, ChevronRight } from 'lucide-react';
import { notificationService } from '../services/notificationService';

export const NativePushBanner: React.FC = () => {
  const [activeNotification, setActiveNotification] = useState<{title: string, message: string} | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleNotify = (title: string, message: string) => {
      setActiveNotification({ title, message });
      setIsVisible(true);
      
      // Auto-hide after 6 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 6000);
    };

    notificationService.subscribe(handleNotify);
    return () => notificationService.unsubscribe(handleNotify);
  }, []);

  if (!activeNotification) return null;

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-[400px] transition-all duration-500 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-32 opacity-0 pointer-events-none'}`}>
      {/* IOS / ANDROID HYBRID STYLE BANNER */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[1.75rem] shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-gray-100/50 p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
          <div className="bg-[#043003] w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm">P</div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Platform Zero</span>
            <span className="text-[10px] text-gray-400 font-medium">now</span>
          </div>
          <h4 className="text-sm font-black text-gray-900 truncate uppercase">{activeNotification.title}</h4>
          <p className="text-xs text-gray-500 font-medium line-clamp-1">{activeNotification.message}</p>
        </div>

        <div className="flex flex-col items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); setIsVisible(false); }} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <X size={14} className="text-gray-400" />
            </button>
        </div>
      </div>
      
      {/* Visual Pull Indicator */}
      <div className="w-12 h-1.5 bg-gray-200/50 rounded-full mx-auto mt-2 blur-[1px]"></div>
    </div>
  );
};
