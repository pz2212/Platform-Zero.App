import React, { useState, useEffect } from 'react';
import { 
  X, Check, DollarSign, Loader2, Sparkles, TrendingUp, AlertTriangle, 
  ChevronRight, Info, Target, Calculator,
  // Added missing Send icon import
  Send
} from 'lucide-react';
import { SupplierPriceRequest, SupplierPriceRequestItem } from '../types';
import { mockService } from '../services/mockDataService';
import { calculateAcceptanceProbability } from '../services/geminiService';

interface WholesalerPriceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SupplierPriceRequest;
  onComplete: () => void;
}

export const WholesalerPriceRequestModal: React.FC<WholesalerPriceRequestModalProps> = ({ isOpen, onClose, request, onComplete }) => {
    const [items, setItems] = useState<SupplierPriceRequestItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiProbabilities, setAiProbabilities] = useState<Record<string, { probability: number, rationale: string }>>({});
    const [loadingAIPId, setLoadingAIPId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && request) {
            setItems(request.items.map(i => ({ ...i })));
            setAiProbabilities({});
        }
    }, [isOpen, request]);

    if (!isOpen || !request) return null;

    const handleMatch = (idx: number) => {
        const newItems = [...items];
        newItems[idx].offeredPrice = newItems[idx].targetPrice;
        newItems[idx].isMatchingTarget = true;
        setItems(newItems);
        // Reset probability for this item
        const newProbs = { ...aiProbabilities };
        delete newProbs[newItems[idx].productId];
        setAiProbabilities(newProbs);
    };

    const handlePriceChange = async (idx: number, val: string) => {
        const newItems = [...items];
        const price = parseFloat(val) || 0;
        newItems[idx].offeredPrice = price;
        newItems[idx].isMatchingTarget = price <= newItems[idx].targetPrice;
        setItems(newItems);

        // Call AI for probability if price is higher than target
        if (price > newItems[idx].targetPrice) {
            setLoadingAIPId(newItems[idx].productId);
            try {
                const result = await calculateAcceptanceProbability(
                    newItems[idx].productName,
                    newItems[idx].invoicePrice,
                    newItems[idx].targetPrice,
                    price
                );
                setAiProbabilities(prev => ({ ...prev, [newItems[idx].productId]: result }));
            } finally {
                setLoadingAIPId(null);
            }
        } else {
            const newProbs = { ...aiProbabilities };
            delete newProbs[newItems[idx].productId];
            setAiProbabilities(newProbs);
        }
    };

    const handleSubmit = async () => {
        const allFilled = items.every(i => i.offeredPrice !== undefined);
        if (!allFilled) {
            alert("Please provide a quote for all items.");
            return;
        }

        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 1200));
        mockService.updateSupplierPriceRequestResponse(request.id, items);
        setIsSubmitting(false);
        onComplete();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#0F172A]/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[95vh]">
                <div className="p-8 md:p-12 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white relative">
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 bg-red-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-red-500/20 animate-pulse border-4 border-white">
                           <AlertTriangle size={32} strokeWidth={2.5}/>
                        </div>
                        <div>
                             <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Urgent Price Audit</h2>
                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-red-200">SLA: 2 Hours</span>
                             </div>
                             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-3">Ref: #{request.id.split('-').pop()} • Customer Lead: {request.customerContext}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-3 bg-white rounded-full shadow-lg border border-gray-100 transition-all active:scale-90"><X size={32}/></button>
                </div>
                
                <div className="p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/30">
                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl mb-10 flex items-start gap-4">
                        <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm shrink-0">
                            <Info size={20}/>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">Trade Opportunity</p>
                            <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                                Provide your best wholesale rates to secure this new customer. Matching the <span className="font-black">PZ Target</span> ensures immediate lead progression.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {items.map((item, idx) => {
                            const aiResult = aiProbabilities[item.productId];
                            const isLoadingAI = loadingAIPId === item.productId;

                            return (
                                <div key={idx} className={`p-8 bg-white rounded-[2.5rem] border-2 transition-all group ${item.offeredPrice && !item.isMatchingTarget ? 'border-orange-200 shadow-xl shadow-orange-500/5' : item.isMatchingTarget ? 'border-emerald-200' : 'border-gray-100 hover:border-indigo-100'}`}>
                                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-center">
                                        <div className="xl:col-span-4">
                                            <h4 className="font-black text-gray-900 text-2xl uppercase tracking-tighter leading-none mb-1.5">{item.productName}</h4>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Weekly Requirement: <span className="text-indigo-600 font-black">{item.qty} units</span>
                                            </div>
                                        </div>

                                        <div className="xl:col-span-3">
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">PZ Target</span>
                                                    <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">Win Floor</span>
                                                </div>
                                                <div className="text-2xl font-black text-emerald-600 tracking-tighter">${item.targetPrice.toFixed(2)}</div>
                                            </div>
                                        </div>

                                        <div className="xl:col-span-5 flex flex-col gap-4">
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleMatch(idx)}
                                                    className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 flex items-center gap-2 ${item.isMatchingTarget ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-500 hover:text-emerald-600'}`}
                                                >
                                                    {item.isMatchingTarget && <Check size={14} strokeWidth={4}/>}
                                                    Match Target
                                                </button>
                                                <div className="relative flex-1 group">
                                                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors"/>
                                                    <input 
                                                        type="number" 
                                                        step="0.01"
                                                        placeholder="Custom Price"
                                                        className={`w-full pl-10 pr-4 py-4 rounded-2xl font-black text-lg outline-none transition-all ${item.offeredPrice && !item.isMatchingTarget ? 'bg-orange-50 border-orange-300 focus:bg-white' : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-indigo-500 shadow-inner-sm'}`}
                                                        value={item.offeredPrice || ''}
                                                        onChange={e => handlePriceChange(idx, e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* AI ACCEPANCE PROBABILITY DISPLAY */}
                                            {(aiResult || isLoadingAI) && (
                                                <div className="animate-in slide-in-from-top-2 duration-300">
                                                    <div className="bg-[#131926] rounded-2xl p-4 flex items-center justify-between border border-white/5 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform rotate-12 scale-125"><Sparkles size={40} className="text-emerald-400"/></div>
                                                        <div className="flex items-center gap-4 relative z-10">
                                                            <div className="text-center">
                                                                {isLoadingAI ? (
                                                                    <Loader2 size={24} className="text-emerald-400 animate-spin"/>
                                                                ) : (
                                                                    <div className={`text-2xl font-black tracking-tighter ${aiResult.probability > 70 ? 'text-emerald-400' : aiResult.probability > 40 ? 'text-orange-400' : 'text-red-400'}`}>
                                                                        {aiResult.probability}%
                                                                    </div>
                                                                )}
                                                                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Acceptance Chance</p>
                                                            </div>
                                                            <div className="h-8 w-px bg-white/5"></div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-0.5">
                                                                    <Sparkles size={10}/> Platform Intelligence
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-medium italic">
                                                                    {isLoadingAI ? "Simulating customer reaction..." : `"${aiResult.rationale}"`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {!isLoadingAI && (
                                                            <div className="bg-white/5 p-2 rounded-lg border border-white/10 shrink-0">
                                                                <TrendingUp size={16} className={aiResult.probability > 60 ? 'text-emerald-400' : 'text-slate-600'}/>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-8 md:p-12 border-t border-gray-100 bg-white sticky bottom-0 z-20 flex flex-col sm:flex-row justify-between items-center gap-8 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
                    <div className="text-left">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">Aggregate Quote Value</p>
                        <div className="flex items-baseline gap-2">
                             <p className="text-4xl font-black text-gray-900 tracking-tighter">${items.reduce((sum, i) => sum + (i.offeredPrice || 0) * i.qty, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                             <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">/ Est. Weekly Revenue</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 w-full sm:w-auto">
                        <button onClick={onClose} className="flex-1 sm:flex-none px-10 py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95">Decline Request</button>
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting || !items.every(i => i.offeredPrice !== undefined)}
                            className="flex-[2] sm:flex-none px-16 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] shadow-xl shadow-red-900/10 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 group"
                        >
                            {/* Fix: Send icon was used but not imported */}
                            {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <><Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/> Submit Final Quote</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};