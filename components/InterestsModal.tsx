
import React, { useState, KeyboardEvent } from 'react';
import { X, Sprout, ShoppingCart, Check, Sparkles, ArrowRight, Plus } from 'lucide-react';
import { User } from '../types';
import { mockService } from '../services/mockDataService';

interface InterestsModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const COMMON_PRODUCE = [
  'TOMATOES', 'EGGPLANT', 'POTATOES', 'ONIONS', 'LETTUCE', 
  'APPLES', 'BANANAS', 'CARROTS', 'BROCCOLI', 'AVOCADOS', 
  'MANGOES', 'BERRIES', 'CITRUS', 'STONEFRUIT', 'HERBS'
];

export const InterestsModal: React.FC<InterestsModalProps> = ({ user, isOpen, onClose, onSaved }) => {
  const [selling, setSelling] = useState<string[]>(user.activeSellingInterests || []);
  const [buying, setBuying] = useState<string[]>(user.activeBuyingInterests || []);
  const [step, setStep] = useState<1 | 2>(1);
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const toggleInterest = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    const upperItem = item.toUpperCase();
    if (list.includes(upperItem)) {
      setList(list.filter(i => i !== upperItem));
    } else {
      setList([...list, upperItem]);
    }
  };

  const addCustomItem = (type: 'selling' | 'buying') => {
    const trimmed = customInput.trim().toUpperCase();
    if (!trimmed) return;
    
    if (type === 'selling' && !selling.includes(trimmed)) {
      setSelling([...selling, trimmed]);
    } else if (type === 'buying' && !buying.includes(trimmed)) {
      setBuying([...buying, trimmed]);
    }
    setCustomInput('');
  };

  const handleKeyDown = (e: KeyboardEvent, type: 'selling' | 'buying') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomItem(type);
    }
  };

  const handleSave = () => {
    mockService.updateUserInterests(user.id, selling, buying);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 md:p-12 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#5c56d6] rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Sparkles size={28} />
            </div>
            <div>
              <h2 className="text-[28px] font-black text-[#0F172A] tracking-tight leading-none uppercase">Market Alignment</h2>
              <p className="text-[11px] font-black text-[#5c56d6] uppercase tracking-[0.2em] mt-1.5">Configure your network visibility</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-all p-2 hover:bg-gray-50 rounded-full">
            <X size={28} strokeWidth={2.5}/>
          </button>
        </div>

        <div className="p-10 md:p-14 space-y-12">
          {step === 1 ? (
            <div className="space-y-10 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 flex items-center justify-center text-[#10B981]">
                    <Sprout size={28} strokeWidth={2.5}/>
                </div>
                <h3 className="font-black uppercase text-base tracking-widest text-[#043003]">What are you SELLING?</h3>
              </div>
              
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Type or select items you currently have in stock or grow. We'll match you with buyers looking for these.
              </p>
              
              {/* Input Area Matching Screenshot */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Type a product name..." 
                    className="w-full pl-6 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.25rem] outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 font-bold text-gray-900 transition-all shadow-inner-sm text-lg"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'selling')}
                  />
                </div>
                <button 
                  onClick={() => addCustomItem('selling')}
                  className="bg-[#043003] text-white p-5 rounded-[1.25rem] shadow-xl hover:bg-black transition-all active:scale-95"
                >
                  <Plus size={28} strokeWidth={3}/>
                </button>
              </div>

              {/* Suggestions Grid */}
              <div className="space-y-6">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Common Market Suggestions</p>
                <div className="flex flex-wrap gap-2.5">
                  {COMMON_PRODUCE.map(item => {
                    const isSelected = selling.includes(item);
                    return (
                        <button
                          key={item}
                          onClick={() => toggleInterest(selling, setSelling, item)}
                          className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                            isSelected 
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' 
                            : 'bg-white border-gray-50 text-gray-400 hover:border-emerald-100 hover:text-emerald-600'
                          }`}
                        >
                          {item}
                        </button>
                    );
                  })}
                </div>
              </div>

              <button 
                onClick={() => { setStep(2); setCustomInput(''); }}
                className="w-full py-6 bg-[#131926] text-white rounded-[1.25rem] font-black text-sm uppercase tracking-[0.25em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-[0.98] group"
              >
                Continue to Buying <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-4 text-[#5c56d6]">
                <ShoppingCart size={28} strokeWidth={2.5}/>
                <h3 className="font-black uppercase text-base tracking-widest">What are you looking to BUY?</h3>
              </div>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Type or select items you frequently source. We'll find network partners who grow or wholesale these.
              </p>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Type what you need..." 
                    className="w-full pl-6 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.25rem] outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 font-bold text-gray-900 transition-all shadow-inner-sm text-lg"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'buying')}
                  />
                </div>
                <button 
                  onClick={() => addCustomItem('buying')}
                  className="bg-[#5c56d6] text-white p-5 rounded-[1.25rem] shadow-xl hover:bg-black transition-all active:scale-95"
                >
                  <Plus size={28} strokeWidth={3}/>
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Common Market Suggestions</p>
                <div className="flex flex-wrap gap-2.5">
                  {COMMON_PRODUCE.map(item => {
                    const isSelected = buying.includes(item);
                    return (
                        <button
                          key={item}
                          onClick={() => toggleInterest(buying, setBuying, item)}
                          className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                            isSelected 
                            ? 'bg-[#5c56d6] border-[#5c56d6] text-white shadow-lg' 
                            : 'bg-white border-gray-50 text-gray-400 hover:border-indigo-100 hover:text-[#5c56d6]'
                          }`}
                        >
                          {item}
                        </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => { setStep(1); setCustomInput(''); }}
                  className="flex-1 py-6 bg-gray-100 text-gray-400 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] py-6 bg-[#043003] text-white rounded-[1.25rem] font-black text-sm uppercase tracking-[0.25em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4"
                >
                  Save & Match Market <Sparkles size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
