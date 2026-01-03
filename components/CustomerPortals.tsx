import React, { useState, useEffect } from 'react';
import { 
  Gift, Users, Tag, Calendar, Megaphone, Plus, Trash2, 
  ToggleLeft, ToggleRight, LayoutDashboard, Settings, DollarSign, 
  ArrowRight, Percent, Briefcase, Sparkles, Save, Check, Loader2,
  Clock, ShieldCheck, History, UserCheck, ChevronDown, Info,
  Wallet, ArrowUpRight, Lock, AlertCircle, FileText, Banknote,
  // Fix line 351: Added missing CheckCircle to imports
  CheckCircle
} from 'lucide-react';
import { mockService, INDUSTRIES, RoleIncentive } from '../services/mockDataService';
import { Industry, UserRole } from '../types';

interface PromoCode {
  id: string;
  code: string;
  discountDisplay: string;
  redemptions: number;
  status: 'Active' | 'Paused';
  type: 'percent' | 'fixed';
  value: number;
}

export const CustomerPortals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'growth' | 'credits'>('growth');
  
  // Incentive Config State
  const [selectedRole, setSelectedRole] = useState<string>(UserRole.CONSUMER);
  const [roleIncentives, setRoleIncentives] = useState<Record<string, RoleIncentive>>(mockService.getRoleIncentives());
  const [isSavingIncentives, setIsSavingIncentives] = useState(false);
  const [hasUnsavedIncentives, setHasUnsavedIncentives] = useState(false);
  const [referralEnabled, setReferralEnabled] = useState(true);

  // Credit / Ledger State
  const [isCashOutLoading, setIsCashOutLoading] = useState(false);

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    { id: '1', code: 'WELCOME50', discountDisplay: '50% OFF', redemptions: 124, status: 'Active', type: 'percent', value: 50 },
    { id: '2', code: 'FREELUNCH', discountDisplay: '$15 CREDIT', redemptions: 45, status: 'Paused', type: 'fixed', value: 15 },
  ]);

  // Industry Incentive State
  const [industryIncentives, setIndustryIncentives] = useState<Record<Industry, number>>(mockService.getIndustryIncentives());
  const [isSavingMultipliers, setIsSavingMultipliers] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleIncentiveChange = (ind: Industry, val: string) => {
    const num = parseFloat(val) || 0;
    setIndustryIncentives(prev => ({ ...prev, [ind]: num }));
    setHasUnsavedChanges(true);
  };

  const handleSaveMultipliers = async () => {
    setIsSavingMultipliers(true);
    Object.entries(industryIncentives).forEach(([ind, val]) => {
      mockService.updateIndustryIncentive(ind as Industry, val as number);
    });
    await new Promise(r => setTimeout(r, 800));
    setIsSavingMultipliers(false);
    setHasUnsavedChanges(false);
  };

  const handleRoleIncentiveUpdate = (field: keyof RoleIncentive, val: any) => {
    setRoleIncentives(prev => ({
      ...prev,
      [selectedRole]: { ...prev[selectedRole], [field]: val }
    }));
    setHasUnsavedIncentives(true);
  };

  const handleSaveRoleIncentives = async () => {
    setIsSavingIncentives(true);
    Object.entries(roleIncentives).forEach(([role, data]) => {
        mockService.updateRoleIncentive(role, data as RoleIncentive);
    });
    await new Promise(r => setTimeout(r, 800));
    setIsSavingIncentives(false);
    setHasUnsavedIncentives(false);
  };

  const handleCashOutAttempt = () => {
      setIsCashOutLoading(true);
      setTimeout(() => {
          setIsCashOutLoading(false);
          alert("⛔ WITHDRAWAL RESTRICTED: Referrer Rewards and Signup Bonuses are non-withdrawable credits. These funds can only be applied as offsets against Platform Zero Marketplace service fees or new trade volume procurement.");
      }, 1000);
  };

  const currentRoleConfig = roleIncentives[selectedRole];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Platform Growth Hub</h1>
        <div className="flex space-x-8 border-b border-gray-100 mt-8">
          <button onClick={() => setActiveTab('overview')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'overview' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400'}`}>Overview & Payouts</button>
          <button onClick={() => setActiveTab('growth')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'growth' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400'}`}>Incentives Engine</button>
          <button onClick={() => setActiveTab('credits')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'credits' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400'}`}>Credit Ledger</button>
        </div>
      </div>

      {activeTab === 'growth' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          
          {/* USER INCENTIVE ENGINE */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-center gap-8">
              <div className="flex gap-5 items-center">
                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-inner-sm"><Gift size={28} /></div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Acquisition Incentives</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Role-based signup bonuses & vesting schedules.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                   <UserCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                   <select 
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full pl-11 pr-10 py-4 bg-white border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-900 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                   >
                      <option value={UserRole.FARMER}>Farmer Profile</option>
                      <option value={UserRole.WHOLESALER}>Wholesaler Profile</option>
                      <option value={UserRole.CONSUMER}>Marketplace Buyer</option>
                      <option value={UserRole.GROCERY}>Grocer / Retailer</option>
                   </select>
                   <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"/>
                </div>
                <button 
                  onClick={handleSaveRoleIncentives}
                  disabled={!hasUnsavedIncentives || isSavingIncentives}
                  className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl active:scale-95 ${
                    hasUnsavedIncentives 
                    ? 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-black' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isSavingIncentives ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                  {hasUnsavedIncentives ? 'Save Incentives' : 'Synced'}
                </button>
              </div>
            </div>

            <div className="p-10">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {/* Left side: Basic Config */}
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <DollarSign size={14}/> PRIMARY SIGNUP BONUS
                    </h4>
                    <div className="relative group">
                        <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={24}/>
                        <input 
                            type="number" 
                            className="w-full pl-14 pr-6 py-6 bg-gray-50 border-2 border-transparent rounded-[1.75rem] font-black text-4xl text-gray-900 outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-inner-sm" 
                            value={currentRoleConfig.amount} 
                            onChange={(e) => handleRoleIncentiveUpdate('amount', parseFloat(e.target.value))}
                        />
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            Credits Total
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-indigo-50/30 p-8 rounded-[2rem] border border-indigo-100/50">
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Vesting Duration</label>
                        <div className="relative">
                            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300"/>
                            <input 
                                type="number" 
                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-indigo-100 rounded-2xl font-black text-lg text-indigo-900 outline-none focus:border-indigo-500 transition-all"
                                value={currentRoleConfig.weeks}
                                onChange={(e) => handleRoleIncentiveUpdate('weeks', parseInt(e.target.value))}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-400 uppercase">Weeks</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Activation Window</label>
                        <div className="relative">
                            <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300"/>
                            <input 
                                type="number" 
                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-indigo-100 rounded-2xl font-black text-lg text-indigo-900 outline-none focus:border-indigo-500 transition-all"
                                value={currentRoleConfig.activationDays}
                                onChange={(e) => handleRoleIncentiveUpdate('activationDays', parseInt(e.target.value))}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-400 uppercase">Days</span>
                        </div>
                    </div>
                    <div className="col-span-full space-y-4">
                        <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Minimum Weekly Spend per Installment</label>
                        <div className="relative">
                            <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300"/>
                            <input 
                                type="number" 
                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-indigo-100 rounded-2xl font-black text-lg text-indigo-900 outline-none focus:border-indigo-500 transition-all"
                                value={currentRoleConfig.minSpendPerWeek}
                                onChange={(e) => handleRoleIncentiveUpdate('minSpendPerWeek', parseFloat(e.target.value))}
                            />
                            <span className="absolute right-12 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-400 uppercase">Required Spend</span>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Referral Bonus & Logic Explanation */}
                <div className="space-y-10">
                   <div className="bg-white rounded-[2rem] border-2 border-gray-100 p-8 shadow-sm">
                      <div className="flex justify-between items-center mb-8">
                         <div className="flex gap-4 items-center">
                            <div className={`p-3 rounded-2xl shadow-sm ${currentRoleConfig.referrerBonusEnabled ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                               <Users size={24}/>
                            </div>
                            <div>
                               <h4 className="font-black text-gray-900 uppercase text-sm">Referrer Reward</h4>
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Bonus for the user who invited them</p>
                            </div>
                         </div>
                         <button onClick={() => handleRoleIncentiveUpdate('referrerBonusEnabled', !currentRoleConfig.referrerBonusEnabled)} className="transition-all active:scale-90">
                            {currentRoleConfig.referrerBonusEnabled ? <ToggleRight size={48} className="text-purple-500 fill-current"/> : <ToggleLeft size={48} className="text-gray-200"/>}
                         </button>
                      </div>

                      {currentRoleConfig.referrerBonusEnabled && (
                         <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                            <div>
                                <label className="block text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1 mb-2">Referral Credit Amount</label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={20}/>
                                    <input 
                                        type="number" 
                                        className="w-full pl-10 pr-4 py-4 bg-purple-50/30 border-2 border-purple-100 rounded-2xl font-black text-2xl text-purple-900 outline-none focus:bg-white focus:border-purple-500 transition-all shadow-inner-sm" 
                                        value={currentRoleConfig.referrerBonusAmount} 
                                        onChange={(e) => handleRoleIncentiveUpdate('referrerBonusAmount', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                            
                            {/* Wholesaler Specific Rule Constraint (Requested Change) */}
                            {selectedRole === UserRole.WHOLESALER && (
                                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
                                    <Info size={16} className="text-orange-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black text-orange-900 uppercase tracking-tight">Wholesaler Network Constraint</p>
                                        <p className="text-[10px] text-orange-700 font-medium leading-relaxed mt-1">
                                            This reward ONLY applies to new buyers discovered via the <span className="font-black">PZ Supplier Marketplace</span>. Invitations for existing off-platform customers do not trigger this credit.
                                        </p>
                                    </div>
                                </div>
                            )}
                         </div>
                      )}
                   </div>

                   <div className="bg-[#0B1221] text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150"><Clock size={120}/></div>
                      <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                         <ShieldCheck size={14}/> Campaign Execution Logic
                      </h4>
                      <div className="space-y-5">
                         <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px] shrink-0">01</div>
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                New <span className="text-white font-black">{selectedRole}</span> signs up and has <span className="text-white font-black">{currentRoleConfig.activationDays} days</span> to place their first order.
                            </p>
                         </div>
                         <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px] shrink-0">02</div>
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                Total bonus of <span className="text-white font-black">${currentRoleConfig.amount}</span> is split into <span className="text-white font-black">{currentRoleConfig.weeks} weekly credits</span> of <span className="text-emerald-400 font-black">${(currentRoleConfig.amount / currentRoleConfig.weeks).toFixed(2)}</span>.
                            </p>
                         </div>
                         <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px] shrink-0">03</div>
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                Each credit only activates if the user spends at least <span className="text-white font-black">${currentRoleConfig.minSpendPerWeek}</span> that week.
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10 group transition-all hover:shadow-xl flex flex-col h-full">
              <div className="flex justify-between items-start mb-10">
                <div className="flex gap-5">
                  <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center shadow-inner-sm"><Users size={28} /></div>
                  <div><h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Referral Message</h3><p className="text-sm text-gray-500 font-medium">Reward viral network growth.</p></div>
                </div>
                <button onClick={() => setReferralEnabled(!referralEnabled)} className="transition-all active:scale-90">{referralEnabled ? <ToggleRight size={48} className="text-emerald-500 fill-current"/> : <ToggleLeft size={48} className="text-gray-200"/>}</button>
              </div>
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-8 text-center flex-1 flex flex-col justify-center items-center">
                <h4 className="text-2xl font-black text-gray-800 mb-1 uppercase tracking-tighter">"Earn up to ${currentRoleConfig.referrerBonusAmount} Credits"</h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Global Marketplace Viral Message</p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
                <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="flex gap-5 items-center">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner-sm"><History size={24} /></div>
                        <div><h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Active Campaigns</h3><p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Summary of live acquisition rules.</p></div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar max-h-[300px] divide-y divide-gray-50">
                    {Object.entries(roleIncentives).map(([role, data]) => {
                        const incentive = data as RoleIncentive;
                        return (
                            <div key={role} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center font-black text-[10px] uppercase">{role.charAt(0)}</div>
                                    <div>
                                        <p className="font-black text-gray-900 text-xs uppercase tracking-tight">{role}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">${incentive.amount} over {incentive.weeks}wks</p>
                                    </div>
                                </div>
                                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">Live</span>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'credits' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
                    <div className="flex justify-between items-start mb-12">
                        <div className="flex gap-5 items-center">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner-sm"><Wallet size={28}/></div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Marketplace Wallet</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Combined Credit & Incentive Ledger</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Trade Revenue (Withdrawable)</p>
                            <h4 className="text-5xl font-black text-gray-900 tracking-tighter">$14,250.00</h4>
                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-2 mt-2">
                                <CheckCircle size={14}/> Settlement Verified
                            </p>
                        </div>
                        <div className="space-y-1.5 bg-gray-50 rounded-3xl p-6 border border-gray-100 relative group">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                Incentives & Rewards <span className="text-orange-500 font-black text-lg">*</span>
                            </p>
                            <h4 className="text-4xl font-black text-indigo-600 tracking-tighter group-hover:scale-105 transition-transform duration-500">$2,450.00</h4>
                            <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                <Lock size={12}/> Restricted Utility
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-10 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3 text-gray-400 italic text-xs max-w-sm">
                           <AlertCircle size={16} className="shrink-0"/>
                           <span><span className="font-black text-gray-900">*</span> Only Trade Revenue from fulfilled marketplace orders is eligible for cash withdrawal.</span>
                        </div>
                        <button 
                            onClick={handleCashOutAttempt}
                            disabled={isCashOutLoading}
                            className="w-full sm:w-auto px-12 py-5 bg-[#0F172A] hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isCashOutLoading ? <Loader2 size={18} className="animate-spin"/> : <Banknote size={18}/>}
                            Withdraw Revenue
                        </button>
                    </div>
                </div>

                <div className="bg-[#0B1221] text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
                        <ShieldCheck size={200}/>
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                            <ShieldCheck size={16}/> Settlement Compliance
                        </h4>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">A</div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    <span className="text-white font-black uppercase">Revenue Protection:</span> In-platform incentives are designed to stimulate marketplace liquidity and cannot be liquidated to external accounts.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">B</div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    <span className="text-white font-black uppercase">Usage Barrier:</span> A hard logical barrier prevents incentive balance inclusion in withdrawal calculations. 
                                </p>
                            </div>
                        </div>
                    </div>
                    <button className="relative z-10 mt-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                        <FileText size={14}/> View Terms of Trade
                    </button>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight flex items-center gap-3">
                        <History size={20} className="text-gray-400"/> Recent Ledger Entries
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">Source / Entity</th>
                                <th className="px-8 py-5">Category</th>
                                <th className="px-8 py-5 text-right">Amount</th>
                                <th className="px-8 py-5 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[
                                { date: '12 Jan 2024', label: 'Sarah Wholesaler', cat: 'Wholesale Trade', amount: 1420.50, status: 'Settled', type: 'revenue' },
                                { date: '11 Jan 2024', label: 'Market Match: Tomatoes', cat: 'Referrer Reward', amount: 200.00, status: 'Restricted', type: 'incentive' },
                                { date: '10 Jan 2024', label: 'PZ Growth Hub', cat: 'New User Bonus', amount: 1000.00, status: 'Restricted', type: 'incentive' },
                            ].map((entry, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6 text-sm font-bold text-gray-400">{entry.date}</td>
                                    <td className="px-8 py-6 font-black text-gray-900 text-sm uppercase tracking-tight">{entry.label}</td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${entry.type === 'revenue' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                                            {entry.cat}
                                        </span>
                                    </td>
                                    <td className={`px-8 py-6 text-right font-black text-lg tracking-tighter ${entry.type === 'revenue' ? 'text-gray-900' : 'text-indigo-600'}`}>+${entry.amount.toFixed(2)}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {entry.status === 'Restricted' && <Lock size={12} className="text-orange-500"/>}
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${entry.status === 'Restricted' ? 'text-orange-600' : 'text-emerald-600'}`}>{entry.status}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
          </div>
      )}

      {/* Industry Incentive Controls (Catalog Multipliers) */}
      {activeTab === 'growth' && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex gap-5 items-center">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner-sm"><Briefcase size={24} /></div>
                <div><h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Industry Multipliers</h3><p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Control category-specific reward percentages.</p></div>
              </div>
              <button 
                onClick={handleSaveMultipliers}
                disabled={!hasUnsavedChanges || isSavingMultipliers}
                className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl active:scale-95 ${
                    hasUnsavedChanges 
                    ? 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-black' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isSavingMultipliers ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                {hasUnsavedChanges ? 'Save Multipliers' : 'Multipliers Synced'}
              </button>
            </div>
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {INDUSTRIES.map(ind => (
                  <div key={ind} className="bg-white p-8 rounded-[2rem] border border-gray-100 flex flex-col gap-6 group hover:border-indigo-200 hover:shadow-xl transition-all relative">
                    <div className="flex justify-between items-start">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">{ind}</p>
                        <div className={`p-3 rounded-2xl transition-all ${industryIncentives[ind] > 15 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-300'}`}>
                            <Sparkles size={20}/>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Percent size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"/>
                                <input 
                                    type="number" 
                                    value={industryIncentives[ind]} 
                                    onChange={(e) => handleIncentiveChange(ind, e.target.value)}
                                    className="w-full pl-6 pr-14 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-black text-2xl text-gray-900 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner-sm"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {hasUnsavedChanges && (
                        <div className="absolute -bottom-2 right-8 bg-orange-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm animate-bounce">
                            Pending Save
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
      )}

      {activeTab === 'growth' && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div className="flex gap-5 items-center">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner-sm"><Tag size={24} /></div>
                <div><h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Promo Codes</h3><p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Manage active discount tokens.</p></div>
              </div>
              <button className="px-6 py-3 bg-[#0F172A] text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg"><Plus size={16}/> Create Code</button>
            </div>
            <div className="p-8">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <tr><th className="py-4 px-4">CODE NAME</th><th className="py-4">DISCOUNT</th><th className="py-4">REDEMPTIONS</th><th className="py-4">STATUS</th><th className="py-4 text-right px-4">ACTIONS</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {promoCodes.map(code => (
                    <tr key={code.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-6 px-4 font-black text-gray-900 font-mono tracking-tighter text-lg">{code.code}</td>
                      <td className="py-6"><span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200">{code.discountDisplay}</span></td>
                      <td className="py-6 font-bold text-gray-500 text-sm">{code.redemptions} Uses</td>
                      <td className="py-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${code.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{code.status}</span></td>
                      <td className="py-6 text-right px-4"><button className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={20}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      )}
    </div>
  );
};