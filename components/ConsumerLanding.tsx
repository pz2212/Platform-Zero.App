import React, { useState, useRef } from 'react';
import { 
  Upload, ArrowRight, CheckCircle, Calendar, DollarSign, 
  TrendingUp, FileText, Loader2, MapPin, Mail, Phone, 
  Building, User, Clock, Star, X, Table, ArrowDown, Rocket, ClipboardList, ShieldCheck, CreditCard, Truck, Users, BookOpen, FilePlus, Sprout, Store, ShoppingCart, ChevronDown, UploadCloud, Leaf, TrendingDown, Sparkles
} from 'lucide-react';
// Fix line 10: Added INDUSTRIES to the import from mockDataService
import { mockService, INDUSTRIES } from '../services/mockDataService';
import { UserRole, Industry } from '../types';
import { CompleteProfileModal } from './CompleteProfileModal';
import { extractInvoiceItems, InvoiceItem } from '../services/geminiService';

export const ConsumerLanding: React.FC<{ onLogin?: () => void }> = ({ onLogin }) => {
  const [step, setStep] = useState<1 | 2 | 4 | 5>(1);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Internal tracking for the temporary lead user
  const [tempUserId, setTempUserId] = useState<string | null>(null);

  // Analysis Data
  const [analysisItems, setAnalysisItems] = useState<InvoiceItem[]>([]);
  const [savingsMetrics, setSavingsMetrics] = useState({
    weekly: 0,
    monthly: 0,
    annual: 0,
    co2: 0
  });

  const CALENDLY_LINK = "https://calendly.com/alex-platformzerosolutions/45min";

  const [formData, setFormData] = useState({
    role: UserRole.CONSUMER as UserRole,
    industry: 'Cafe' as Industry,
    businessName: '',
    location: '',
    email: '',
    name: '',
    mobile: '',
    weeklySpend: '',
    orderFreq: '1-2 (Weekly)',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmitLead = async () => {
    setIsSubmittingLead(true);
    
    try {
      const mockLeadId = `u-lead-${Date.now()}`;
      setTempUserId(mockLeadId);

      if (formData.role === UserRole.CONSUMER && file) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        const base64 = await base64Promise;
        const items = await extractInvoiceItems(base64, file.type);
        
        if (items && items.length > 0) {
          setAnalysisItems(items);
          const weeklySavings = items.reduce((sum, item) => sum + (item.marketRate - item.pzRate) * item.qty, 0);
          setSavingsMetrics({
            weekly: weeklySavings,
            monthly: weeklySavings * 4.33,
            annual: weeklySavings * 52,
            co2: weeklySavings * 1.4
          });

          mockService.submitConsumerSignup({
              ...formData,
              id: mockLeadId,
              orderFrequency: formData.orderFreq,
              weeklySpend: parseFloat(formData.weeklySpend) || 0,
              invoiceFile: `data:${file.type};base64,${base64}`
          });

          setStep(2);
        } else {
          mockService.submitConsumerSignup({
              ...formData,
              id: mockLeadId,
              orderFrequency: formData.orderFreq,
              weeklySpend: parseFloat(formData.weeklySpend) || 0,
              invoiceFile: `data:${file.type};base64,${base64}`
          });
          setStep(4);
        }
      } else {
        await new Promise(r => setTimeout(r, 1200));
        mockService.submitConsumerSignup({
            ...formData,
            id: mockLeadId,
            requestedRole: formData.role
        });
        setStep(4);
      }
    } catch (err) {
      console.error("Analysis failed", err);
      mockService.submitConsumerSignup({
          ...formData,
          orderFrequency: formData.orderFreq,
          weeklySpend: parseFloat(formData.weeklySpend) || 0
      });
      setStep(4);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleOpenCalendly = () => {
    window.open(CALENDLY_LINK, '_blank');
  };

  const handleProfileComplete = () => {
      // Transition to the final thank you page
      setStep(5);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-gray-900 flex flex-col relative">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
           <span className="font-bold text-xl tracking-tight text-gray-900">Platform Zero</span>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm hidden sm:block">Already a member?</span>
            <button onClick={onLogin} className="text-emerald-600 hover:text-emerald-700 font-bold text-sm">Log in</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex-1 flex flex-col justify-center">
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
            {/* HERO CONTENT */}
            <div className="space-y-8 lg:pr-12 animate-in slide-in-from-left-4 duration-700">
              <div className="max-w-xl">
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-[#0F172A] leading-[1.05] mb-6 tracking-tight">
                  Stop overpaying for <br/><span className="text-[#10B981]">fresh produce.</span>
                </h1>
                <p className="text-lg md:text-[18px] text-[#64748B] leading-relaxed">
                  Join the marketplace connecting restaurants directly to farms and wholesalers. Upload your invoice, and we'll show you exactly how much you'll save.
                </p>
              </div>

              <div className="space-y-5">
                 <div className="flex items-center gap-3 text-base md:text-[18px] font-bold text-[#334155]">
                    <div className="text-[#10B981] p-1 rounded-full bg-emerald-50"><CheckCircle size={24} /></div> 
                    Direct-to-source pricing
                 </div>
                 <div className="flex items-center gap-3 text-base md:text-[18px] font-bold text-[#334155]">
                    <div className="text-[#10B981] p-1 rounded-full bg-emerald-50"><CheckCircle size={24} /></div> 
                    Consolidated billing & logistics
                 </div>
                 <div className="flex items-center gap-3 text-base md:text-[18px] font-bold text-[#334155]">
                    <div className="text-[#10B981] p-1 rounded-full bg-emerald-50"><CheckCircle size={24} /></div> 
                    Reduce food waste & carbon footprint
                 </div>
              </div>

              <div className="bg-[#ECFDF5] border border-[#D1FAE5] rounded-[1.5rem] p-6 md:p-8 max-w-lg mt-8 shadow-sm">
                  <div className="flex items-center gap-2 text-[#065F46] font-black uppercase text-xs md:text-sm tracking-widest mb-3">
                      <Star size={20} fill="currentColor" className="text-[#10B981]" /> Limited Offer
                  </div>
                  <p className="text-[#065F46] text-sm md:text-[15px] leading-relaxed font-medium">
                      Book an onboarding call today and receive <span className="font-black">$1,000 credit</span> in your portal.
                  </p>
              </div>
            </div>

            {/* FORM CONTAINER */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 w-full animate-in fade-in zoom-in-95 duration-500 lg:sticky lg:top-24">
              <div className="bg-gray-100/80 p-1.5 rounded-2xl flex mb-10 border border-gray-100">
                <button onClick={() => handleRoleSelect(UserRole.CONSUMER)} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${formData.role === UserRole.CONSUMER ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-50'}`}><ShoppingCart size={20} className="mb-1"/><span className="text-[10px] font-black uppercase tracking-widest">Buyer</span></button>
                <button onClick={() => handleRoleSelect(UserRole.WHOLESALER)} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${formData.role === UserRole.WHOLESALER ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400 hover:text-gray-50'}`}><Building size={20} className="mb-1"/><span className="text-[10px] font-black uppercase tracking-widest">Supplier</span></button>
                <button onClick={() => handleRoleSelect(UserRole.FARMER)} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${formData.role === UserRole.FARMER ? 'bg-white shadow-md text-emerald-600' : 'text-gray-400 hover:text-gray-50'}`}><Sprout size={20} className="mb-1"/><span className="text-[10px] font-black uppercase tracking-widest">Farmer</span></button>
              </div>

              <div className="mb-8">
                 <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
                   {formData.role === UserRole.CONSUMER ? 'Get Your Savings Analysis' : 'Join the Marketplace'}
                 </h2>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">YOUR NAME</label>
                    <div className="relative"><User size={16} className="absolute left-3.5 top-3.5 text-gray-300"/><input name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-gray-900 placeholder-gray-300 transition-all" /></div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">MOBILE</label>
                    <div className="relative"><Phone size={16} className="absolute left-3.5 top-3.5 text-gray-300"/><input name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="0400 000 000" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-gray-900 placeholder-gray-300 transition-all" /></div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">BUSINESS NAME</label>
                  <div className="relative"><Building size={16} className="absolute left-3.5 top-3.5 text-gray-300"/><input name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="The Morning Cafe" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-gray-900 placeholder-gray-300 transition-all" /></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">EMAIL</label>
                    <div className="relative"><Mail size={16} className="absolute left-3.5 top-3.5 text-gray-300"/><input name="email" value={formData.email} onChange={handleInputChange} placeholder="john@cafe.com" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-gray-900 placeholder-gray-300 transition-all" /></div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">LOCATION</label>
                    <div className="relative"><MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-300"/><input name="location" value={formData.location} onChange={handleInputChange} placeholder="Melbourne, VIC" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-gray-900 placeholder-gray-300 transition-all" /></div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">INDUSTRY</label>
                  <div className="relative">
                    <Store size={16} className="absolute left-3.5 top-3.5 text-gray-300"/>
                    <select 
                      name="industry" 
                      value={formData.industry} 
                      onChange={handleInputChange} 
                      className="w-full pl-10 pr-10 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-gray-900 appearance-none transition-all"
                    >
                      {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-4 text-gray-400 pointer-events-none" size={16}/>
                  </div>
                </div>

                {formData.role === UserRole.CONSUMER && (
                  <>
                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                        <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">WEEKLY SPEND ($)</label>
                        <div className="relative"><DollarSign size={16} className="absolute left-3.5 top-3.5 text-gray-300"/><input type="number" name="weeklySpend" value={formData.weeklySpend} onChange={handleInputChange} placeholder="2500" className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-gray-900 placeholder-gray-300 transition-all" /></div>
                        </div>
                        <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ORDERS / MONTH</label>
                        <div className="relative"><Clock size={16} className="absolute left-3.5 top-3.5 text-gray-300"/><select name="orderFreq" value={formData.orderFreq} onChange={handleInputChange} className="w-full pl-10 pr-10 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-gray-900 appearance-none transition-all"><option>1-2 (Weekly)</option><option>3-5 (Weekly)</option><option>Daily</option></select><ChevronDown className="absolute right-3.5 top-4 text-gray-400 pointer-events-none" size={16}/></div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">UPLOAD RECENT INVOICE</label>
                        <div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }} className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer bg-white group ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                            {file ? (
                                <div className="flex flex-col items-center gap-1"><CheckCircle size={28} className="text-emerald-500" /><span className="text-sm font-bold text-gray-900 truncate max-w-full px-4">{file.name}</span><button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-[10px] text-red-500 font-bold uppercase mt-1">Remove</button></div>
                            ) : (
                                <div className="flex flex-col items-center"><div className="bg-gray-100 p-2 rounded-full mb-3 text-gray-400 group-hover:text-indigo-500 group-hover:bg-white transition-all shadow-inner-sm"><UploadCloud size={24} /></div><p className="text-sm font-black text-gray-900">Click to upload or drag and drop</p><p className="text-[10px] text-gray-500 mt-1 font-medium">PDF or Image to compare prices</p></div>
                            )}
                        </div>
                    </div>
                  </>
                )}

                <button onClick={handleSubmitLead} disabled={isSubmittingLead} className="w-full py-5 bg-[#0B1221] text-white rounded-2xl font-black text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 mt-6 group">
                  {isSubmittingLead ? <Loader2 size={20} className="animate-spin" /> : <>{formData.role === UserRole.CONSUMER ? 'Analyze & See Savings' : 'Next'}<ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500">
             <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2 rounded-full border border-emerald-100 shadow-sm animate-bounce">
                    <Sparkles size={18}/>
                    <span className="text-xs font-black uppercase tracking-[0.15em]">Analysis Complete</span>
                </div>
                <h2 className="text-4xl md:text-[48px] font-black text-[#0F172A] tracking-tighter leading-none">Your Potential Savings</h2>
                <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto">We've analyzed your invoice against Platform Zero's source pricing. Here is how much you're leaving on the table.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Weekly */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between group hover:border-emerald-200 transition-all">
                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Weekly Savings</span>
                        <h3 className="text-4xl font-black text-[#0F172A] tracking-tighter">${savingsMetrics.weekly.toFixed(0)}</h3>
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-50">
                        <p className="text-xs text-gray-500 font-bold leading-relaxed italic">Equivalent to 4 free staff lunch services per week.</p>
                    </div>
                </div>

                {/* Monthly */}
                <div className="bg-[#043003] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between transform md:scale-105 z-10">
                    <div className="absolute top-0 right-0 p-12 opacity-5 transform rotate-12 scale-150"><TrendingDown size={140} className="text-emerald-400"/></div>
                    <div className="relative z-10">
                        <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest block mb-1">Monthly Savings</span>
                        <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter">${savingsMetrics.monthly.toFixed(0)}</h3>
                    </div>
                    <div className="relative z-10 mt-8 pt-6 border-t border-emerald-900">
                        <p className="text-sm text-emerald-400 font-black flex items-center gap-2">
                           <CheckCircle size={16}/> PROVEN ROI
                        </p>
                    </div>
                </div>

                {/* Annual */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between group hover:border-emerald-200 transition-all">
                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Annual Savings</span>
                        <h3 className="text-4xl font-black text-[#0F172A] tracking-tighter">${savingsMetrics.annual.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><Leaf size={20}/></div>
                            <div>
                                <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">Environmental Impact</p>
                                <p className="text-xs text-emerald-600 font-black">{savingsMetrics.co2.toFixed(0)}kg CO2 Diverted / Year</p>
                            </div>
                        </div>
                    </div>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm overflow-hidden">
                <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight mb-6 flex items-center gap-2">
                    <Table size={20} className="text-indigo-500"/> Item Breakdown
                </h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-100">
                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <th className="pb-4 pr-4">Product Name</th>
                                <th className="pb-4 text-center">Qty</th>
                                <th className="pb-4 text-right">Your Rate</th>
                                <th className="pb-4 text-right text-emerald-600">PZ Rate</th>
                                <th className="pb-4 text-right">Savings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {analysisItems.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 font-bold text-gray-900">{item.name}</td>
                                    <td className="py-4 text-center font-bold text-gray-500">{item.qty}</td>
                                    <td className="py-4 text-right font-medium text-gray-400 line-through">${item.marketRate.toFixed(2)}</td>
                                    <td className="py-4 text-right font-black text-emerald-600">${item.pzRate.toFixed(2)}</td>
                                    <td className="py-4 text-right">
                                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                                            -{(((item.marketRate - item.pzRate) / item.marketRate) * 100).toFixed(0)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4">
                 <button onClick={() => setStep(1)} className="flex-1 py-5 bg-white border-2 border-gray-200 rounded-[2rem] font-black text-sm uppercase tracking-[0.15em] text-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                    <ArrowLeft size={18}/> Retake Analysis
                 </button>
                 <button onClick={() => setStep(4)} className="flex-[2] py-5 bg-[#0F172A] text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 group">
                    Claim My Savings & Continue <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                 </button>
             </div>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-md mx-auto text-center space-y-10 animate-in zoom-in-95 duration-500">
             <div>
                <span className="bg-[#D1FAE5] text-[#065F46] px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm">
                    APPLICATION RECEIVED
                </span>
                <h2 className="text-[44px] font-black text-[#0F172A] tracking-tighter mt-8 mb-4 leading-none">What's next?</h2>
                <p className="text-[#64748B] text-base leading-relaxed font-medium">
                    Your request has been placed in our <span className="text-[#0F172A] font-black">Pending Review</span> queue. You can continue setting up your profile now to speed up the approval process.
                </p>
             </div>

             <div className="space-y-4">
                <div onClick={() => setIsProfileModalOpen(true)} className="bg-white border-2 border-[#10B981] rounded-2xl p-7 text-left relative shadow-xl shadow-emerald-500/10 group cursor-pointer hover:scale-[1.02] transition-all">
                    <div className="bg-[#10B981] text-white text-[9px] font-black uppercase tracking-[0.15em] px-4 py-1.5 rounded-bl-xl rounded-tr-xl absolute top-0 right-0 shadow-sm">FAST TRACK</div>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#ECFDF5] text-[#10B981] rounded-2xl flex items-center justify-center shrink-0 shadow-inner-sm"><ClipboardList size={32} /></div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Complete Profile</h3>
                            <p className="text-sm text-[#64748B] font-medium leading-snug mt-1.5">Finalise your business and logistics details for the admin to review.</p>
                            <button className="text-[#10B981] font-black text-xs uppercase tracking-[0.2em] mt-5 flex items-center gap-2 group-hover:gap-3 transition-all">START SETUP <ArrowRight size={16}/></button>
                        </div>
                    </div>
                </div>

                <div onClick={handleOpenCalendly} className="bg-white border-2 border-gray-100 rounded-2xl p-7 text-left shadow-sm group cursor-pointer hover:border-indigo-100 hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#EFF6FF] text-[#2563EB] rounded-2xl flex items-center justify-center shrink-0 shadow-inner-sm"><Calendar size={32} /></div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Book a Demo</h3>
                            <p className="text-sm text-[#64748B] font-medium leading-snug mt-1.5">Schedule a 15-min call with our specialist for a guided tour.</p>
                            <button className="text-[#2563EB] font-black text-xs uppercase tracking-[0.2em] mt-5 flex items-center gap-2 group-hover:gap-3 transition-all">SELECT TIME <ArrowRight size={16}/></button>
                        </div>
                    </div>
                </div>
             </div>

             <button onClick={() => setStep(1)} className="block mx-auto text-[#64748B] font-black text-[10px] uppercase tracking-[0.3em] hover:text-[#0F172A] transition-colors pt-4">BACK TO START</button>
          </div>
        )}

        {step === 5 && (
          <div className="max-w-xl mx-auto text-center space-y-12 animate-in zoom-in-95 duration-500 py-12">
             <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner-sm border-2 border-emerald-200">
                <CheckCircle size={48} />
             </div>
             <div>
                <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-none mb-6">Profile Submitted</h2>
                <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-sm">
                    <p className="text-xl text-[#043003] font-black leading-relaxed">
                        Thank you very much for completing profile we will be in contact within the next business day to start trade.
                    </p>
                </div>
             </div>
             
             <div className="space-y-4">
                 <div className="flex items-center justify-center gap-2 text-[#64748B] font-bold text-xs uppercase tracking-widest">
                    <Clock size={16} /> Awaiting Verification
                 </div>
                 <button onClick={() => setStep(1)} className="px-10 py-5 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all active:scale-95">Return to Marketplace</button>
             </div>
          </div>
        )}

      </div>

      <CompleteProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        user={{
            id: tempUserId || 'u-new-lead',
            name: formData.name,
            businessName: formData.businessName,
            role: formData.role,
            email: formData.email,
            phone: formData.mobile,
            industry: formData.industry
        } as any}
        onComplete={handleProfileComplete}
      />
    </div>
  );
};

const ArrowLeft = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);