import React, { useState } from 'react';
import { 
  X, UserPlus, ShieldCheck, Mail, Smartphone, 
  Building, CreditCard, FileText, ChevronRight, 
  Copy, Send, Sparkles, CheckCircle2, Loader2
} from 'lucide-react';
import { User, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';

interface InviteBuyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  wholesaler: User;
}

const TERM_OPTIONS = ['COB', '7 Days', '14 Days', '30 Days'];

export const InviteBuyerModal: React.FC<InviteBuyerModalProps> = ({ isOpen, onClose, wholesaler }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRequestId, setGeneratedRequestId] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    paymentTerms: '7 Days',
    customTerms: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1200));
      
      const request = mockService.createManualInvite({
        businessName: formData.businessName,
        name: formData.name,
        email: formData.email,
        mobile: formData.phone,
        role: UserRole.CONSUMER,
        paymentTerms: formData.paymentTerms,
        customTerms: formData.customTerms
      });
      
      setGeneratedRequestId(request.id);
      setStep('success');
    } catch (err) {
      alert("Failed to generate invite. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inviteLink = generateProductDeepLink('portal', generatedRequestId.split('-').pop() || 'new-buyer');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Onboarding link copied to clipboard!");
  };

  const handleSendSms = () => {
    const msg = `Hi ${formData.name}! ${wholesaler.businessName} has invited you to join Platform Zero. Review terms and complete your portal setup here: ${inviteLink}`;
    triggerNativeSms(formData.phone, msg);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl my-8 animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#0F172A] tracking-tight leading-none uppercase">Provision Buyer Portal</h2>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Direct Wholesaler-to-Buyer Invitation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full">
            <X size={24} />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleGenerateInvite} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
            
            {/* SECTION 1: CONTACT */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-gray-900 mb-6">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                <h3 className="font-black uppercase text-sm tracking-widest">Buyer Contact Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">Full Name</label>
                   <div className="relative">
                      <UserPlus size={16} className="absolute left-4 top-4 text-gray-400"/>
                      <input name="name" required placeholder="Buyer Contact Name" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none" value={formData.name} onChange={handleInputChange}/>
                   </div>
                </div>
                <div className="md:col-span-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">Business Trading Name</label>
                   <div className="relative">
                      <Building size={16} className="absolute left-4 top-4 text-gray-400"/>
                      <input name="businessName" required placeholder="e.g. The Morning Cafe" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none" value={formData.businessName} onChange={handleInputChange}/>
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">Email Address</label>
                   <div className="relative">
                      <Mail size={16} className="absolute left-4 top-4 text-gray-400"/>
                      <input name="email" type="email" required placeholder="name@business.com" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none" value={formData.email} onChange={handleInputChange}/>
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">Phone / Mobile</label>
                   <div className="relative">
                      <Smartphone size={16} className="absolute left-4 top-4 text-gray-400"/>
                      <input name="phone" required placeholder="0400 000 000" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none" value={formData.phone} onChange={handleInputChange}/>
                   </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: TERMS */}
            <section className="bg-indigo-50/30 p-8 rounded-[2.5rem] border border-indigo-100/50 space-y-6">
              <div className="flex items-center gap-3 text-indigo-900 mb-2">
                <CreditCard size={20} className="text-indigo-600"/>
                <h3 className="font-black uppercase text-sm tracking-widest">Trade & Credit Config</h3>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 block">Payment Terms</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TERM_OPTIONS.map(term => (
                    <button 
                      key={term}
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, paymentTerms: term}))}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.paymentTerms === term ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-white text-gray-400 hover:border-indigo-100 hover:text-indigo-600'}`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 block">Additional Wholesaler Terms (Optional)</label>
                <textarea 
                  name="customTerms"
                  placeholder="e.g. Free delivery over $500, No split boxes..."
                  className="w-full p-4 bg-white border border-indigo-100 rounded-2xl text-sm font-bold text-gray-900 h-24 resize-none outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-gray-300"
                  value={formData.customTerms}
                  onChange={handleInputChange}
                />
              </div>
            </section>

            {/* SECTION 3: LEGAL / NDA */}
            <section className="bg-[#0F172A] p-8 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-1/4 -translate-y-1/4">
                 <ShieldCheck size={180}/>
               </div>
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck size={20} className="text-emerald-400"/>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Legal Disclosure & NDA</h4>
                 </div>
                 <div className="space-y-3 text-[11px] text-slate-400 font-medium leading-relaxed italic">
                    <p>By generating this invite and the buyer signing the resulting onboarding form, both parties acknowledge a binding Non-Disclosure Agreement with <span className="text-white font-black">Platform Zero Solutions</span>.</p>
                    <p>All intellectual property, software design, marketplace logic, and network relationships introduced via this invitation belong exclusively to Platform Zero.</p>
                 </div>
               </div>
            </section>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-[#043003] hover:bg-black text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20}/> : <><Sparkles size={20}/> Generate Onboarding Link</>}
            </button>
          </form>
        ) : (
          <div className="p-12 text-center space-y-10 animate-in fade-in zoom-in-95">
             <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner-sm">
                <CheckCircle2 size={48} />
             </div>
             <div>
                <h3 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase mb-2">Portal Ready</h3>
                <p className="text-gray-500 font-medium max-w-md mx-auto leading-relaxed">Invitation generated for <span className="text-gray-900 font-bold">{formData.businessName}</span>. Share the link below to initiate the onboarding process.</p>
             </div>

             <div className="space-y-4">
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-6 rounded-3xl flex items-center gap-4 group hover:border-indigo-400 transition-all">
                    <div className="flex-1 text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Unique Setup URL</p>
                        <p className="text-xs font-mono font-black text-indigo-600 truncate">{inviteLink}</p>
                    </div>
                    <button onClick={handleCopyLink} className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-emerald-50 text-emerald-600 shadow-sm transition-all active:scale-90"><Copy size={20}/></button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                        onClick={handleSendSms}
                        className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Smartphone size={18}/> Send via SMS
                    </button>
                    <button 
                        onClick={() => window.open(`mailto:${formData.email}?subject=Invitation to join Platform Zero&body=Hi ${formData.name}, please complete your portal setup here: ${inviteLink}`)}
                        className="py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Mail size={18}/> Send via Email
                    </button>
                </div>
             </div>

             <button onClick={onClose} className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-indigo-600 transition-colors">Back to directory</button>
          </div>
        )}
      </div>
    </div>
  );
};