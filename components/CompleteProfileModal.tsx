import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Building2, ShieldAlert, CheckCircle2, Mail, Phone, MapPin, 
  ChevronRight, Landmark, Users2, PackageSearch, HelpCircle,
  TrendingUp, Sparkles, Sprout, ShoppingCart, CheckCircle, Truck, BookOpen,
  Check, Loader2
} from 'lucide-react';
import { User, UserRole, BusinessProfile } from '../types';
import { mockService } from '../services/mockDataService';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onComplete: () => void;
}

const TermsModal = ({ isOpen, onClose, onAccept }: { isOpen: boolean, onClose: () => void, onAccept: () => void }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // Precision fix: trigger when within 50px of the bottom to account for browser zoom/scaling
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
      if (isAtBottom) {
        setHasScrolledToBottom(true);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure layout is calculated before check
      const timer = setTimeout(() => handleScroll(), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight uppercase leading-none">Terms of Trade</h2>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Platform Zero Solutions</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-900 transition-colors p-1">
            <X size={28} strokeWidth={2.5} />
          </button>
        </div>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-10 space-y-6 text-sm text-gray-600 leading-relaxed custom-scrollbar bg-gray-50/30"
        >
          <div className="space-y-8 bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
            <div>
              <h3 className="font-black text-gray-900 text-xl uppercase tracking-tight mb-4">Platform Zero Terms and Conditions</h3>
              <p className="text-xs font-medium text-gray-500 mb-6">These Terms and Conditions govern the sale of fresh goods supplied by Platform Zero (“Platform Zero”) to the customer (“Customer”). By placing an order, the Customer agrees to be bound by these Terms.</p>
            </div>

            <div className="space-y-6">
              <section>
                <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-2">1. Payment terms</h4>
                <p className="mb-2"><strong className="text-gray-800 uppercase text-[10px]">Standard terms:</strong> Unless using Platform Zero’s American Express partnership, invoices must be paid within 7 days of the order date.</p>
                <p><strong className="text-gray-800 uppercase text-[10px]">Extended terms via Amex:</strong> Customers seeking extended payment terms through our American Express partnership must complete onboarding and sign required documentation.</p>
              </section>

              <section>
                <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-2">2. Late payments</h4>
                <p>If there is an outstanding invoice, Platform Zero reserves the right to suspend fulfillment and take legal action. The Customer is liable for all collection costs, debt collector expenses, court costs, and solicitor fees.</p>
              </section>

              <section className="bg-red-50 p-4 rounded-2xl border border-red-100">
                <h4 className="font-black text-red-900 uppercase text-xs tracking-widest mb-2">3. Reporting issues</h4>
                <p className="mb-2 text-red-800">The Customer must notify Platform Zero within <strong className="font-black underline">one hour</strong> of receiving goods if there are any issues (missing, damaged, or quality concerns).</p>
                <p className="text-red-800">To qualify for credit, photographic evidence must be provided through the portal. <strong className="font-black">Without photo evidence, no credit will be issued within 4 hours of receiving product.</strong></p>
              </section>

              <section>
                <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-2">4. Credits and replacements</h4>
                <p>Claims must be made within 4 hours of receipt. No credits issued after this period. Quality credits are subject to return of goods if requested.</p>
              </section>

              <section>
                <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-2">5. Transport costs</h4>
                <p>Transport is included in product prices for delivery locations within a 10km radius of the CBD.</p>
              </section>

              <section>
                <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-2">6. Pricing</h4>
                <p>Prices fluctuate with market conditions. If the market rate increases by more than 25% from a locked price, Platform Zero reserves the right to charge the current daily market rate.</p>
              </section>

              <section>
                <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-2">7. Governing law</h4>
                <p>Terms are governed by the laws of the jurisdiction in which Platform Zero operates.</p>
              </section>

              <section>
                <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-2">8. Third-party processing</h4>
                <p>Platform Zero uses accredited third-party SQF processors. The Customer must not purchase directly from the processor. Circumvention results in legal action for loss of income.</p>
              </section>

              <section className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <h4 className="font-black text-indigo-900 uppercase text-xs tracking-widest mb-2">9. Pre-orders</h4>
                <p className="mb-2">Customers must provide <strong className="font-black">7 days’ notice</strong> if they do not intend to place their usual order. Failure to notify results in a charge equal to the average daily order value over the past three weeks.</p>
              </section>

              <section className="bg-[#0B1221] p-6 rounded-2xl text-white">
                <h4 className="font-black text-emerald-400 uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                    <ShieldAlert size={16}/> 10. NDA & IP Protection
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                    The Customer acknowledges that <span className="text-white font-black">all design, intellectual property, marketplace software architecture, and business relationships</span> belong exclusively to Platform Zero Solutions. 
                </p>
                <p className="text-emerald-400 font-black text-xs mt-3 uppercase tracking-tight">
                    NO COMPONENT OR RELATIONSHIP MAY BE COPIED OR CIRCUMVENTED BY MORE THAN 3% WITHOUT EXPRESS CONSENT.
                </p>
              </section>

              <section>
                <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-2">11. Acceptance</h4>
                <p>By placing an order, you agree to these terms. No signature is required; terms are fully accepted upon the first order made.</p>
              </section>
            </div>

            <div className="pt-8 border-t border-gray-100 text-[10px] font-bold text-gray-400">
              ABN 53 667 679 003 • 10-20 Gwynne St, Cremorne, VIC 3121<br/>
              commercial@platformzerosolutions.com
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100">
          {!hasScrolledToBottom ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-3 text-gray-400 font-black text-xs uppercase tracking-widest animate-pulse">
                Scroll to bottom to accept <ChevronRight size={16}/>
              </div>
              <p className="text-[9px] text-gray-300 font-bold uppercase">All 11 sections must be read to enable trade agreement</p>
            </div>
          ) : (
            <button 
              onClick={onAccept}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3 animate-in fade-in"
            >
              <CheckCircle2 size={20}/> I Accept Terms & NDA
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({ isOpen, onClose, user, onComplete }) => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: user.businessName || '',
    abn: user.businessProfile?.abn || '',
    address: user.businessProfile?.businessLocation || '',
    // Banking
    bankName: user.businessProfile?.bankName || '',
    bsb: user.businessProfile?.bsb || '',
    accountNumber: user.businessProfile?.accountNumber || '',
    // Director
    directorName: user.directorName || user.name || '',
    directorEmail: user.email || '',
    directorPhone: user.phone || '',
    // Accounts
    accountsName: '',
    accountsEmail: '',
    accountsPhone: '',
    // Trade Mix
    productsSell: '',
    productsGrow: '',
    productsBuy: '',
    // Logistics
    hasLogistics: false,
    wantPzAgent: false,
    acceptTerms: false
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleAcceptFromModal = () => {
    setFormData(prev => ({ ...prev, acceptTerms: true }));
    setIsTermsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      alert("Please review and accept the Terms of Trade to proceed.");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1500));

    mockService.updateBusinessProfile(user.id, {
      ...formData,
      companyName: formData.businessName,
      businessLocation: formData.address,
      isPzAgent: formData.wantPzAgent,
      isComplete: true,
    } as any);

    setIsSubmitting(false);
    onComplete();
    onClose();
  };

  const SectionHeader = ({ icon: Icon, title, sub }: any) => (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner-sm">
        <Icon size={24} strokeWidth={2.5}/>
      </div>
      <div>
        <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight leading-none">{title}</h3>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{sub}</p>
      </div>
    </div>
  );

  const FormInput = ({ label, name, placeholder, required = true, type = "text" }: any) => (
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 block">{label}</label>
      <input 
        name={name} 
        type={type}
        placeholder={placeholder} 
        required={required}
        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-gray-300" 
        value={(formData as any)[name]} 
        onChange={handleInputChange} 
      />
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl my-8 animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
          
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#043003] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">P</div>
              <div>
                <h2 className="text-2xl font-black text-[#0F172A] tracking-tight leading-none uppercase">Marketplace Registration</h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">Official Trade Setup • B2B Protocol</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full">
              <X size={24} strokeWidth={2.5} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 pt-6 space-y-12 custom-scrollbar">
            
            <section className="animate-in slide-in-from-left-4">
              <SectionHeader icon={Building2} title="Trade Entity" sub="Business Identification" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FormInput label="Full Trading Name" name="businessName" placeholder="e.g. Fresh Wholesalers Pty Ltd" />
                </div>
                <FormInput label="ABN" name="abn" placeholder="53 667 679 003" />
                <FormInput label="Registered Business Address" name="address" placeholder="e.g. Unit 4, 12 Market St, Pooraka SA" />
              </div>
            </section>

            <section className="bg-emerald-50/20 p-8 rounded-[2.5rem] border border-emerald-100/50 animate-in slide-in-from-left-4 duration-300">
              <SectionHeader icon={Landmark} title="Settlement Details" sub="For automated marketplace clearing" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput label="Bank Institution" name="bankName" placeholder="e.g. CommBank" />
                <FormInput label="BSB" name="bsb" placeholder="000-000" />
                <FormInput label="Account No." name="accountNumber" placeholder="12345678" />
              </div>
            </section>

            <section className="animate-in slide-in-from-left-4 duration-500">
              <SectionHeader icon={Users2} title="Decision Makers" sub="Director & Accounts Contacts" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest border-b border-indigo-50 pb-2 mb-4">
                    <CheckCircle size={14}/> Managing Director
                  </div>
                  <FormInput label="Full Name" name="directorName" />
                  <FormInput label="Business Email" name="directorEmail" type="email" />
                  <FormInput label="Direct Mobile" name="directorPhone" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest border-b border-indigo-50 pb-2 mb-4">
                    <CheckCircle size={14}/> Accounts Payable
                  </div>
                  <FormInput label="Contact Name" name="accountsName" />
                  <FormInput label="AP Email" name="accountsEmail" type="email" />
                  <FormInput label="AP Phone" name="accountsPhone" />
                </div>
              </div>
            </section>

            <section className="animate-in slide-in-from-left-4 duration-700">
              <SectionHeader icon={PackageSearch} title="Produce Capability" sub="Defining your market mix" />
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500"/> Core Inventory Varieties
                  </label>
                  <textarea 
                    name="productsSell" 
                    placeholder="e.g. Premium Tomatoes, Onions, Potatoes..." 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 h-24 resize-none outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                    value={formData.productsSell} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#10B981] mb-6">
                <ShieldAlert size={18} strokeWidth={2.5}/>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900">Legal Agreement</h3>
              </div>
              
              <div 
                onClick={() => !formData.acceptTerms && setIsTermsOpen(true)}
                className={`flex items-center gap-5 p-6 border-2 rounded-[2rem] transition-all shadow-sm cursor-pointer ${formData.acceptTerms ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100 hover:border-emerald-300 group'}`}
              >
                <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all ${formData.acceptTerms ? 'bg-emerald-500 border-emerald-200 text-white' : 'bg-white border-gray-200 text-transparent group-hover:border-emerald-200'}`}>
                  <Check size={24} strokeWidth={4}/>
                </div>
                <div className="flex-1">
                  <p className="text-base text-gray-900 font-black tracking-tight leading-none mb-1.5">Market Terms & NDA</p>
                  <p className="text-xs text-gray-400 font-medium">I verify that I am authorized to bind this business entity.</p>
                </div>
                {!formData.acceptTerms && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest group-hover:underline">Scroll to Accept</span>}
              </div>

              <div className="flex justify-between items-center px-4 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsTermsOpen(true)}
                  className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-indigo-600 transition-colors"
                >
                  <BookOpen size={14}/> View Full Agreement PDF
                </button>
                <div className="flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${formData.acceptTerms ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`}></span>
                   <span className={`font-black text-[10px] uppercase tracking-widest ${formData.acceptTerms ? 'text-emerald-600' : 'text-orange-500'}`}>
                     {formData.acceptTerms ? 'Terms Accepted' : 'Awaiting Scroll'}
                   </span>
                </div>
              </div>
            </section>
          </form>

          <div className="p-8 border-t border-gray-100 bg-white sticky bottom-0 z-10 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!formData.acceptTerms || isSubmitting}
              className="flex-[2] py-5 bg-[#043003] hover:bg-black disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {/* Added missing Loader2 import and used here */}
              {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><CheckCircle size={20}/> Finalize Trade Identity</>}
            </button>
          </div>
        </div>
      </div>

      <TermsModal 
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
        onAccept={handleAcceptFromModal} 
      />
    </>
  );
};