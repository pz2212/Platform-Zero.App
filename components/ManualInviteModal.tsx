
import React, { useState } from 'react';
import { 
  X, UserPlus, Building, User, Mail, Smartphone, 
  CheckCircle2, Loader2, Sparkles, Copy, Send, 
  Sprout, Store, ShoppingCart, Briefcase, ShieldCheck, 
  ChevronRight, Smartphone as SmartphoneIcon,
  AlertTriangle,
  Check
} from 'lucide-react';
import { UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { triggerNativeSms } from '../services/smsService';

interface ManualInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_CONFIG = [
  { id: UserRole.FARMER, label: 'FARMER', icon: Sprout, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: UserRole.WHOLESALER, label: 'WHOLESALER', icon: Building, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: UserRole.GROCERY, label: 'GROCER', icon: Store, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: UserRole.CONSUMER, label: 'MARKETPLACE', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: UserRole.PZ_REP, label: 'SALES REP', icon: Briefcase, color: 'text-slate-500', bg: 'bg-slate-50' },
  { id: UserRole.ADMIN, label: 'PZ ADMIN', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

export const ManualInviteModal: React.FC<ManualInviteModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  
  const [formData, setFormData] = useState({
    businessName: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    role: UserRole.CONSUMER
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate delay
    await new Promise(r => setTimeout(r, 1200));

    const invite = mockService.createManualPortalInvite(formData);
    setGeneratedCode(invite.code);
    setIsSubmitting(false);
    setStep('SUCCESS');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    alert("Invite code copied to clipboard!");
  };

  const handleSendSms = () => {
    if (!formData.mobile) {
        alert("No mobile number provided.");
        return;
    }
    // Correct link pointing to the actual site origin with #login hook
    const appUrl = window.location.origin + window.location.pathname + '#login';
    // Exact formatting from screenshot: "PZ INVITE: Hi [Name] ! ... access code is: [Code]. Log in at [URL] ..."
    const message = `PZ INVITE: Hi ${formData.firstName} ! You've been invited to Platform Zero. Your unique access code is: ${generatedCode}. Log in at ${appUrl} to finish your onboarding.`;
    triggerNativeSms(formData.mobile, message);
  };

  const handleSendEmail = () => {
    if (!formData.email) {
        alert("No email address provided.");
        return;
    }
    const appUrl = window.location.origin + window.location.pathname + '#login';
    const subject = encodeURIComponent("Welcome to Platform Zero");
    const body = encodeURIComponent(`Hi ${formData.firstName},\n\nYou've been invited to Platform Zero. Your unique access code to start your trade onboarding is: ${generatedCode}\n\nLog in here: ${appUrl}\n\nBest regards,\nPlatform Zero Admin`);
    window.open(`mailto:${formData.email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        
        <div className="p-8 md:p-10 border-b border-gray-50 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#043003] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">P</div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">Manual Portal Provision</h2>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-2">Direct Network Onboarding Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2 bg-white rounded-full border border-gray-100 shadow-sm transition-all active:scale-90"><X size={28} strokeWidth={2.5}/></button>
        </div>

        {step === 'FORM' ? (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 pt-6 space-y-10 custom-scrollbar">
            
            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <User size={14} className="text-gray-300"/> IDENTITY & ENTITY
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Trading Business Name</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-100 p-1.5 rounded-lg text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                                <Building size={16}/>
                            </div>
                            <input 
                                required 
                                className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all text-sm" 
                                placeholder="e.g. Green Valley Farms"
                                value={formData.businessName}
                                onChange={e => setFormData({...formData, businessName: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">First Name</label>
                        <input 
                            required 
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all text-sm" 
                            placeholder="Alex"
                            value={formData.firstName}
                            onChange={e => setFormData({...formData, firstName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Last Name</label>
                        <input 
                            required 
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all text-sm" 
                            placeholder="Johnson"
                            value={formData.lastName}
                            onChange={e => setFormData({...formData, lastName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Business Email</label>
                        <div className="relative group">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"/>
                            <input 
                                required 
                                type="email"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all text-sm" 
                                placeholder="name@business.com"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mobile Number</label>
                        <div className="relative group">
                            <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"/>
                            <input 
                                required 
                                type="tel"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all text-sm" 
                                placeholder="0400 000 000"
                                value={formData.mobile}
                                onChange={e => setFormData({...formData, mobile: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <ShieldCheck size={14} className="text-gray-300"/> SELECT PORTAL ACCESS
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ROLE_CONFIG.map(role => (
                        <button 
                            key={role.id}
                            type="button"
                            onClick={() => setFormData({...formData, role: role.id})}
                            className={`p-6 rounded-[1.75rem] border-2 transition-all flex flex-col items-center gap-3 group relative ${formData.role === role.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-100 hover:text-indigo-600'}`}
                        >
                            <role.icon size={24} strokeWidth={2.5} className={formData.role === role.id ? 'text-white' : role.color} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{role.label}</span>
                            {formData.role === role.id && (
                                <div className="absolute top-2 right-2 bg-white text-indigo-600 p-1 rounded-full shadow-sm animate-in zoom-in duration-300">
                                    <Check size={10} strokeWidth={4}/>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 flex items-start gap-4">
                <div className="bg-white p-2.5 rounded-xl shadow-sm text-orange-600 border border-orange-100 flex-shrink-0">
                    <AlertTriangle size={20}/>
                </div>
                <div>
                    <p className="text-xs font-black text-orange-900 uppercase tracking-tight leading-none mb-1">Onboarding Restricted</p>
                    <p className="text-[11px] text-orange-700 font-medium leading-relaxed">This user will be forced to complete and submit trade documents upon first login. <span className="font-black">Trade functionality remains disabled</span> until admin verification.</p>
                </div>
            </div>

            <button 
                type="submit"
                disabled={isSubmitting || !formData.businessName || !formData.firstName || !formData.mobile}
                className="w-full py-6 bg-[#8FA18F] hover:bg-[#043003] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
                {isSubmitting ? <Loader2 className="animate-spin" size={24}/> : <><Sparkles size={22}/> Generate Access Code</>}
            </button>
          </form>
        ) : (
          <div className="p-12 text-center space-y-10 animate-in zoom-in-95 duration-500 bg-white">
             <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner-sm">
                <CheckCircle2 size={48} strokeWidth={2.5}/>
             </div>
             <div>
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Invite Generated</h3>
                <p className="text-gray-500 font-medium max-w-sm mx-auto">Portal provisioned for <span className="text-gray-900 font-black">{formData.businessName}</span>. This entity is now in the "Waiting" queue.</p>
             </div>

             <div className="space-y-6">
                <div className="bg-gray-50 border-4 border-dashed border-gray-200 p-10 rounded-[3rem] flex flex-col items-center gap-2 group hover:border-indigo-400 transition-all cursor-pointer shadow-inner-sm" onClick={handleCopyCode}>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Access Verification Code</p>
                    <p className="text-6xl font-black text-indigo-600 font-mono tracking-tighter">{generatedCode}</p>
                    <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy size={12}/> Click to copy code
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <button 
                        onClick={handleSendSms}
                        className="py-5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <SmartphoneIcon size={20}/> Dispatch via SMS
                    </button>
                    <button 
                        onClick={handleSendEmail}
                        className="py-5 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Mail size={20}/> Dispatch via Email
                    </button>
                </div>
             </div>

             <div className="pt-8 flex flex-col gap-4">
                <button 
                    onClick={onClose}
                    className="w-full py-5 bg-gray-100 text-gray-400 border border-gray-200 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-gray-200 transition-all"
                >
                    Return to Control Center
                </button>
                <button 
                    onClick={() => { setStep('FORM'); setGeneratedCode(''); }}
                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-colors"
                >
                    Invite another business
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
