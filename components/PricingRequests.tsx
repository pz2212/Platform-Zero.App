
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Product, RegistrationRequest, SupplierPriceRequest } from '../types';
import { mockService } from '../services/mockDataService';
import { extractInvoiceItems } from '../services/geminiService';
import { 
  Calculator, Download, Mail, Building, TrendingDown, 
  FileText, Upload, X, Loader2, Send, CheckCircle, MapPin, DollarSign,
  Store, ChevronDown, Check, Rocket, FilePlus, Percent, ArrowRight,
  TrendingUp, AlertCircle, Clock, Share2, FileDown, Package, Users
} from 'lucide-react';

interface ComparisonItem {
  productId: string;
  name: string;
  qty: number;
  invoicePrice: number;    
}

export const PricingRequests: React.FC<{ user: User }> = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { req?: RegistrationRequest } || {};

  // Calculator State
  const [customerName, setCustomerName] = useState(state.req?.businessName || '');
  const [customerLoc, setCustomerLoc] = useState(state.req?.consumerData?.location || '');
  const [invoiceFileName, setInvoiceFileName] = useState<string | null>(state.req?.consumerData?.invoiceFile ? 'Uploaded_Invoice.pdf' : null);
  const [pzSavingsPercent, setPzSavingsPercent] = useState<number>(30);
  const [supplierTargetPercent, setSupplierTargetPercent] = useState<number>(55);
  const [selectedWholesalerIds, setSelectedWholesalerIds] = useState<string[]>([]);
  
  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);

  useEffect(() => {
    if (state.req?.consumerData?.invoiceFile) {
        handleAnalyze(state.req.consumerData.invoiceFile);
    }
  }, [state.req]);

  const handleAnalyze = async (fileData: string) => {
      setIsProcessing(true);
      try {
          const base64 = fileData.split(',')[1] || fileData;
          const extracted = await extractInvoiceItems(base64, 'application/pdf');
          const allProducts = mockService.getAllProducts();
          
          const items: ComparisonItem[] = extracted.map(item => ({
              productId: allProducts.find(p => p.name.toLowerCase().includes(item.name.toLowerCase()))?.id || 'p1',
              name: item.name,
              qty: item.qty,
              invoicePrice: item.marketRate
          }));

          setComparisonItems(items);
          setIsGenerated(true);
      } catch (err) {
          console.error("AI Analysis failed", err);
      } finally {
          setIsProcessing(false);
      }
  };

  const calculatePzPrice = (invoicePrice: number) => {
      return invoicePrice * (1 - (pzSavingsPercent / 100));
  };

  const calculateWholesaleTarget = (invoicePrice: number) => {
      return invoicePrice * (supplierTargetPercent / 100);
  };

  const toggleWholesaler = (id: string) => {
      setSelectedWholesalerIds(prev => 
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
  };

  const handleAssignToWholesalers = () => {
      if (selectedWholesalerIds.length === 0) return alert("Select at least one wholesaler.");
      
      selectedWholesalerIds.forEach(whId => {
          const priceRequest: SupplierPriceRequest = {
              id: `pr-${Date.now()}-${whId}`,
              supplierId: whId,
              status: 'PENDING',
              createdAt: new Date().toISOString(),
              customerContext: customerName,
              customerLocation: customerLoc,
              items: comparisonItems.map(item => ({
                  productId: item.productId,
                  productName: item.name,
                  qty: item.qty,
                  invoicePrice: item.invoicePrice,
                  targetPrice: calculateWholesaleTarget(item.invoicePrice)
              }))
          };

          mockService.createSupplierPriceRequest(priceRequest);
          mockService.addAppNotification(
              whId, 
              'New Price Sourcing Assignment', 
              `Platform Zero HQ has assigned a new pricing audit for ${customerName}.`, 
              'PRICE_REQUEST'
          );
      });
      
      alert(`Pricing assignments sent to ${selectedWholesalerIds.length} wholesalers!`);
      navigate('/');
  };

  const totalCurrentSpend = comparisonItems.reduce((sum, item) => sum + (item.invoicePrice * item.qty), 0);
  const totalPzSpend = comparisonItems.reduce((sum, item) => sum + (calculatePzPrice(item.invoicePrice) * item.qty), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="px-2">
        <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Pricing Comparison Tool</h1>
        <p className="text-gray-500 font-bold mt-2">Analyze invoices and generate competitive quotes for multiple partners.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT SIDEBAR - CALCULATOR */}
        <div className="w-full lg:w-[380px] space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Calculator size={24} /></div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Calculator</h2>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Customer Name</label>
                        <div className="relative group">
                            <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors"/>
                            <input 
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all"
                                placeholder="e.g. Alex"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Location</label>
                        <div className="relative group">
                            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors"/>
                            <input 
                                value={customerLoc}
                                onChange={(e) => setCustomerLoc(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all"
                                placeholder="e.g. Melbourne"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Upload Invoice (Optional)</label>
                        <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all bg-emerald-50/20 border-emerald-200`}>
                            {invoiceFileName ? (
                                <div className="flex items-center justify-between gap-3 text-emerald-700">
                                    <div className="flex items-center gap-3">
                                        <FileText size={20}/>
                                        <span className="text-xs font-black truncate max-w-[150px]">{invoiceFileName}</span>
                                    </div>
                                    <button onClick={() => setInvoiceFileName(null)} className="p-1 hover:bg-emerald-100 rounded-lg"><X size={16}/></button>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <Upload className="mx-auto text-emerald-500 mb-2" size={24}/>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase">Attach Competitor PDF</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                           <Users size={14}/> Select Target Wholesalers ({selectedWholesalerIds.length})
                        </label>
                        <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {mockService.getWholesalers().map(w => (
                                <label key={w.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedWholesalerIds.includes(w.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${selectedWholesalerIds.includes(w.id) ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400'}`}>
                                            {w.businessName.charAt(0)}
                                        </div>
                                        <span className={`text-xs font-bold ${selectedWholesalerIds.includes(w.id) ? 'text-indigo-900' : 'text-gray-600'}`}>{w.businessName}</span>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="sr-only"
                                        checked={selectedWholesalerIds.includes(w.id)}
                                        onChange={() => toggleWholesaler(w.id)}
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedWholesalerIds.includes(w.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}>
                                        {selectedWholesalerIds.includes(w.id) && <Check size={12} className="text-white" strokeWidth={4}/>}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">PZ Savings (%)</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[10px]">%</span>
                                <input 
                                    type="number" value={pzSavingsPercent}
                                    onChange={(e) => setPzSavingsPercent(parseFloat(e.target.value))}
                                    className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-black text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Supplier Target (%)</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[10px]">%</span>
                                <input 
                                    type="number" value={supplierTargetPercent}
                                    onChange={(e) => setSupplierTargetPercent(parseFloat(e.target.value))}
                                    className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleAssignToWholesalers}
                        disabled={!isGenerated || selectedWholesalerIds.length === 0}
                        className="w-full py-5 bg-[#5c56d6] hover:bg-[#4a44b8] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        <Send size={20}/> Dispatch To {selectedWholesalerIds.length} Partners
                    </button>
                </div>
            </div>

            {/* ANALYSIS SUMMARY BOX */}
            {isGenerated && (
                <div className="bg-[#131926] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group animate-in slide-in-from-bottom-4">
                    <div className="relative z-10 space-y-8">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">ANALYSIS SUMMARY</p>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-400">Total Current Spend</span>
                            <span className="text-xl font-bold text-gray-500 line-through">${totalCurrentSpend.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-400">Total PZ Target</span>
                            <span className="text-4xl font-black text-[#10b981] tracking-tighter">${totalPzSpend.toFixed(2)}</span>
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <div className="flex items-center gap-2 text-[#10b981] mb-3 font-black text-xs uppercase tracking-widest">
                                <TrendingDown size={14}/> Projected Savings
                            </div>
                            <div className="flex justify-between items-end">
                                <h3 className="text-6xl font-black tracking-tighter">${(totalCurrentSpend - totalPzSpend).toFixed(2)}</h3>
                                <span className="bg-[#064e3b] text-[#10b981] px-4 py-1.5 rounded-xl text-[11px] font-black border border-emerald-500/20">{pzSavingsPercent}% Saved</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 scale-150 pointer-events-none"><Calculator size={200}/></div>
                </div>
            )}
        </div>

        {/* MAIN COMPARISON WORKSPACE */}
        <div className="flex-1">
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/30">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-indigo-600">
                            <Building size={32}/>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">{customerName || 'Draft Lead Comparison'}</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Market Audit Results</p>
                        </div>
                    </div>
                    {isGenerated && (
                        <div className="flex items-center gap-3">
                             <div className="bg-emerald-50 px-6 py-2.5 rounded-2xl border border-emerald-100 text-center">
                                <span className="block text-[8px] font-black text-emerald-400 uppercase tracking-widest">Pricing Status</span>
                                <span className="text-emerald-700 font-black text-sm uppercase">Audit Optimized</span>
                             </div>
                        </div>
                    )}
                </div>

                <div className="p-10 flex-1 overflow-x-auto">
                    {isProcessing ? (
                        <div className="h-full flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 size={64} className="animate-spin text-indigo-600"/>
                            <p className="font-black text-gray-400 uppercase tracking-widest text-xs">AI Extraction in progress...</p>
                        </div>
                    ) : isGenerated ? (
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest b-b border-gray-100">
                                <tr>
                                    <th className="pb-8 pr-4">Invoice Item (Qty)</th>
                                    <th className="pb-8 text-right px-4">Org. Rate</th>
                                    <th className="pb-8 text-right px-4 text-emerald-600">New Cust. Rate</th>
                                    <th className="pb-8 text-right px-4 text-indigo-600">Wholesale Target</th>
                                    <th className="pb-8 text-right px-4">Admin Margin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {comparisonItems.map((item, idx) => {
                                    const pzPrice = calculatePzPrice(item.invoicePrice);
                                    const supplierTarget = calculateWholesaleTarget(item.invoicePrice);
                                    return (
                                        <tr key={idx} className="group hover:bg-gray-50/30 transition-colors">
                                            <td className="py-8 pr-4">
                                                <div className="font-black text-gray-900 uppercase text-lg leading-tight">{item.name}</div>
                                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                                    <Package size={12}/> Volume: {item.qty} units detected
                                                </div>
                                            </td>
                                            <td className="py-8 text-right px-4 text-gray-300 font-bold line-through text-lg">${item.invoicePrice.toFixed(2)}</td>
                                            <td className="py-8 text-right px-4 font-black text-emerald-600 text-3xl tracking-tighter">${pzPrice.toFixed(2)}</td>
                                            <td className="py-8 text-right px-4 font-black text-indigo-600 text-3xl tracking-tighter bg-indigo-50/20">${supplierTarget.toFixed(2)}</td>
                                            <td className="py-8 text-right px-4">
                                                <span className="bg-white border-2 border-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm">
                                                    +${(pzPrice - supplierTarget).toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-30 grayscale">
                            <Calculator size={80} className="text-gray-400 mb-6"/>
                            <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tight mb-2">Analysis Workspace</h3>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest max-w-xs mx-auto">Upload an invoice from a new lead to populate this workspace.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
