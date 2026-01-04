
import React, { useState, useRef } from 'react';
import { 
  ArrowRight, CheckCircle, Package, Sprout, Building, Store, ShoppingCart, 
  X, UserPlus, Smartphone, Mail, Sparkles, Loader2, Check, Upload, Clock, Wind,
  Star, User as UserIcon, MapPin, ChevronDown, DollarSign
} from 'lucide-react';
import { UserRole } from '../types';
import { mockService } from '../services/mockDataService';

const FormInput = ({ label, placeholder, icon: Icon, type = "text", value, onChange, prefix }: any) => (
    <div className="space-y-1.5">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors">
                <Icon size={18}/>
            </div>
            {prefix && (
                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                    {prefix}
                </div>
            )}
            <input 
                required 
                type={type}
                placeholder={placeholder} 
                className={`w-full ${prefix ? 'pl-14' : 'pl-12'} pr-4 py-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all placeholder-gray-300 shadow-sm`}
                value={value}
                onChange={onChange}
            />
        </div>
    </div>
);

export const ConsumerLanding: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'BUYER' | 'SUPPLIER' | 'FARMER'>('BUYER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    mobile: '',
    location: '',
    industry: 'Cafe',
    weeklySpend: '',
    ordersPerMonth: '1-2 (Weekly)',
    role: UserRole.CONSUMER
  });

  const handleTabChange = (tab: 'BUYER' | 'SUPPLIER' | 'FARMER') => {
    setActiveTab(tab);
    let role = UserRole.CONSUMER;
    if (tab === 'SUPPLIER') role = UserRole.WHOLESALER;
    if (tab === 'FARMER') role = UserRole.FARMER;
    setFormData({ ...formData, role });
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    
    // Split name for mock service
    const names = formData.name.split(' ');
    mockService.submitSignup({
      businessName: formData.businessName,
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
      email: formData.email,
      mobile: formData.mobile,
      requestedRole: formData.role
    });
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md px-6 py-5 flex justify-between items-center sticky top-0 z-50 border-b border-gray-50">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-[#043003] rounded-lg flex items-center justify-center text-white font-black text-xl shadow-sm">P</div>
           <span className="font-black text-xl tracking-tight text-gray-900">Platform Zero</span>
        </div>
        <div className="flex items-center gap-8">
            <button onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-900 font-bold text-sm tracking-tight hover:text-emerald-700 transition-colors hidden sm:block">Sign up</button>
            <button onClick={onLogin} className="text-[#10B981] font-bold text-sm tracking-tight hover:text-[#043003] transition-colors">Log in</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-16">
          
          {/* Left: Hero Content */}
          <div className="lg:w-[45%] space-y-8">
            <h1 className="text-[48px] md:text-7xl font-black text-[#0F172A] tracking-tighter leading-[0.95] mb-6">
                Stop overpaying for <br/>
                <span className="text-[#10B981]">fresh produce.</span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                Join the marketplace connecting restaurants directly to farms and wholesalers. Upload your invoice, and we'll show you exactly how much you'll save.
            </p>
            
            <div className="space-y-6 pt-4">
                {[
                    "Direct-to-source pricing",
                    "Consolidated billing & logistics",
                    "Reduce food waste & carbon footprint"
                ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                        <div className="w-7 h-7 rounded-full bg-white border-2 border-[#10B981] flex items-center justify-center text-[#10B981] shadow-sm group-hover:bg-emerald-50 transition-colors">
                            <Check size={16} strokeWidth={4} />
                        </div>
                        <span className="font-bold text-[#1E293B] text-lg md:text-xl">{text}</span>
                    </div>
                ))}
            </div>

            {/* Limited Offer Card */}
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-[2rem] p-8 mt-12 relative overflow-hidden group">
                <div className="flex items-start gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-[#10B981]">
                        <Star className="fill-current" size={24}/>
                    </div>
                    <div>
                        <p className="text-[#15803D] text-[10px] font-black uppercase tracking-[0.2em] mb-2">Limited Offer</p>
                        <p className="text-[#166534] text-lg md:text-xl font-bold leading-snug">
                            Book an onboarding call today and receive <span className="font-black">$1,000 credit</span> in your portal.
                        </p>
                    </div>
                </div>
            </div>
          </div>

          {/* Right: Savings Analysis Form Card */}
          <div ref={formRef} className="lg:w-[50%] w-full">
            <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden animate-in slide-in-from-right-10 duration-1000">
                
                {/* Segmented Tab Selector */}
                <div className="p-3 bg-[#F8FAFC] flex gap-2">
                    {[
                        { id: 'BUYER', icon: ShoppingCart, label: 'BUYER' },
                        { id: 'SUPPLIER', icon: Building, label: 'SUPPLIER' },
                        { id: 'FARMER', icon: Sprout, label: 'FARMER' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleTabChange(tab.id as any)}
                            className={`flex-1 flex flex-col items-center gap-2 py-6 rounded-[2.5rem] transition-all duration-300 ${activeTab === tab.id ? 'bg-white shadow-xl text-blue-600 ring-1 ring-black/[0.03]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <tab.icon size={26} className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-300'} />
                            <span className="text-[10px] font-black tracking-[0.1em]">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-10 md:p-14">
                    <h2 className="text-[32px] font-black text-[#0F172A] tracking-tight mb-12 text-left leading-tight">
                        {activeTab === 'BUYER' ? 'Get Your Savings Analysis' : activeTab === 'SUPPLIER' ? 'Join the Marketplace' : 'Join the Marketplace'}
                    </h2>

                    {!isSuccess ? (
                        <form onSubmit={handleSignupSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                <div className="md:col-span-2">
                                    <FormInput 
                                        label="YOUR NAME" 
                                        placeholder="John Doe" 
                                        icon={UserIcon}
                                        value={formData.name}
                                        onChange={(e: any) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <FormInput 
                                        label="MOBILE" 
                                        placeholder="0400 000 000" 
                                        icon={Smartphone}
                                        value={formData.mobile}
                                        onChange={(e: any) => setFormData({...formData, mobile: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <FormInput 
                                        label="BUSINESS NAME" 
                                        placeholder="The Morning Cafe" 
                                        icon={Building}
                                        value={formData.businessName}
                                        onChange={(e: any) => setFormData({...formData, businessName: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <FormInput 
                                        label="EMAIL" 
                                        placeholder="john@cafe.com" 
                                        icon={Mail}
                                        type="email"
                                        value={formData.email}
                                        onChange={(e: any) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <FormInput 
                                        label="LOCATION" 
                                        placeholder="Melbourne, VIC" 
                                        icon={MapPin}
                                        value={formData.location}
                                        onChange={(e: any) => setFormData({...formData, location: e.target.value})}
                                    />
                                </div>
                                
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">INDUSTRY</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                                            <Store size={18}/>
                                        </div>
                                        <select 
                                            className="w-full pl-12 pr-10 py-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all appearance-none shadow-sm"
                                            value={formData.industry}
                                            onChange={e => setFormData({...formData, industry: e.target.value})}
                                        >
                                            <option value="Cafe">Cafe</option>
                                            <option value="Restaurant">Restaurant</option>
                                            <option value="Grocery Store">Grocery Store</option>
                                            <option value="Pub">Pub</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18}/>
                                    </div>
                                </div>

                                {activeTab === 'BUYER' && (
                                    <>
                                        <div className="md:col-span-1">
                                            <FormInput 
                                                label="WEEKLY SPEND ($)" 
                                                placeholder="2500" 
                                                icon={DollarSign}
                                                type="number"
                                                prefix="$"
                                                value={formData.weeklySpend}
                                                onChange={(e: any) => setFormData({...formData, weeklySpend: e.target.value})}
                                            />
                                        </div>
                                        <div className="md:col-span-1 space-y-1.5">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ORDERS / MONTH</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                                                    <Clock size={18}/>
                                                </div>
                                                <select 
                                                    className="w-full pl-12 pr-10 py-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all appearance-none shadow-sm"
                                                    value={formData.ordersPerMonth}
                                                    onChange={e => setFormData({...formData, ordersPerMonth: e.target.value})}
                                                >
                                                    <option>1-2 (Weekly)</option>
                                                    <option>3-4 (Daily)</option>
                                                    <option>Every Day</option>
                                                    <option>Custom</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18}/>
                                            </div>
                                        </div>
                                        
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">UPLOAD RECENT INVOICE</label>
                                            <div className="border-2 border-dashed border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center gap-3 bg-[#F8FAFC] hover:bg-emerald-50/30 hover:border-emerald-200 transition-all cursor-pointer group">
                                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-300 group-hover:text-emerald-500 transition-colors">
                                                    <Upload size={24}/>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-black text-gray-900">Click to upload or drag and drop</p>
                                                    <p className="text-xs text-gray-400 font-medium mt-1">PDF or Image to compare prices</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full py-6 bg-[#0B1221] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 size={20} className="animate-spin" /> ANALYZING...</>
                                    ) : (
                                        <>ANALYZE & SEE SAVINGS <ArrowRight size={20}/></>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-20 space-y-8 animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner-sm">
                                <CheckCircle size={48} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase">Analysis Sent</h3>
                                <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto mt-2">
                                    Thanks, {formData.name.split(' ')[0]}! We've received your request. One of our reps will contact you shortly with your direct pricing analysis.
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsSuccess(false)}
                                className="px-10 py-4 bg-gray-100 text-gray-900 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
                            >
                                Submit another analysis
                            </button>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* Basic Footer */}
      <footer className="bg-white border-t border-gray-50 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#043003] rounded-md flex items-center justify-center text-white text-xs font-bold">P</div>
                  <span className="font-black text-sm text-gray-900 uppercase tracking-tighter">Platform Zero</span>
              </div>
              <div className="text-gray-300 text-[10px] font-black uppercase tracking-widest">
                  © 2024 Platform Zero Solutions. All rights reserved.
              </div>
          </div>
      </footer>
    </div>
  );
};
