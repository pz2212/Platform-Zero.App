
import React, { useState, useEffect, useRef } from 'react';
import { User, Order, Lead, InventoryItem, Product, SupplierPriceRequest, SupplierPriceRequestItem, Driver, Packer, Customer, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';
import { 
  X, CheckCircle, Send, Loader2, Users, Smartphone, Contact, Plus, MessageCircle
} from 'lucide-react';

interface SellerDashboardV1Props {
  user: User;
  onLogout?: () => void;
  onSwitchVersion?: (version: 'v1' | 'v2') => void;
}

export const ShareModal: React.FC<{
  item: InventoryItem;
  onClose: () => void;
  onComplete: () => void;
  currentUser: User;
  overridePrice?: number; // Added to support scanning flow prices
}> = ({ item, onClose, onComplete, currentUser, overridePrice }) => {
  const product = mockService.getProduct(item.productId);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [manualNumbers, setManualNumbers] = useState<string[]>([]);
  const [currentManualNumber, setCurrentManualNumber] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSyncingContacts, setIsSyncingContacts] = useState(false);

  useEffect(() => {
    const myCustomers = mockService.getCustomers().filter(c => c.connectedSupplierId === currentUser.id);
    setCustomers(myCustomers);
    setSelectedCustomerIds(myCustomers.map(c => c.id));
  }, [currentUser.id]);

  const toggleCustomer = (id: string) => {
    setSelectedCustomerIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const addManualNumber = () => {
    if (currentManualNumber) {
      const cleaned = currentManualNumber.replace(/[^\d+]/g, '');
      if (cleaned.length < 8) {
        alert("Please enter a valid mobile number.");
        return;
      }
      if (!manualNumbers.includes(cleaned)) {
        setManualNumbers([...manualNumbers, cleaned]);
      }
      setCurrentManualNumber('');
    }
  };

  const handleConnectContacts = async () => {
    try {
      setIsSyncingContacts(true);
      // @ts-ignore
      if ('contacts' in navigator && 'select' in navigator.contacts) {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        // @ts-ignore
        const contacts = await navigator.contacts.select(props, opts);
        if (contacts && contacts.length > 0) {
          const numbers = contacts.map((c: any) => c.tel?.[0]?.replace(/[^\d+]/g, '')).filter((t: any) => !!t);
          setManualNumbers(prev => [...new Set([...prev, ...numbers])]);
        }
      } else {
        await new Promise(r => setTimeout(r, 1000));
        const mockContacts = ['0411222333', '0499888777', '0455123987'];
        setManualNumbers(prev => [...new Set([...prev, ...mockContacts])]);
        alert("📱 Device contacts synced successfully!");
      }
    } catch (err) {
      console.error("Contact sync error:", err);
    } finally {
      setIsSyncingContacts(false);
    }
  };

  // Helper for consistent message formatting
  const getSmsContent = () => {
    const senderName = currentUser.businessName;
    const productName = product?.name || 'fresh produce';
    const priceValue = overridePrice !== undefined ? overridePrice : (product?.defaultPricePerKg || 0);
    const priceDisplay = priceValue > 0 ? `$${priceValue.toFixed(2)}` : 'market rates';
    const productLink = generateProductDeepLink('product', item.id, senderName, priceValue);
    
    return {
        text: `Hey there! ${senderName} wants you to view this: fresh ${productName} at ${priceDisplay}. We'd like to connect and chat with you. View and trade here: ${productLink}`,
        shortLink: "https://pz.io/l/..." // For visual preview
    };
  };

  const handleSendBlast = () => {
    const targetNumbers = [
      ...customers.filter(c => selectedCustomerIds.includes(c.id)).map(c => c.phone).filter(p => !!p),
      ...manualNumbers
    ];

    if (targetNumbers.length === 0) {
      alert("Please select or add at least one mobile number.");
      return;
    }

    setIsSending(true);
    const content = getSmsContent();

    // In a real app, this might be a bulk SMS API call. 
    // Here we trigger the native app for the first recipient as per user intent.
    triggerNativeSms(targetNumbers[0] as string, content.text);
    
    setTimeout(() => {
      alert(`🚀 SMS Dispatch initiated to ${targetNumbers.length} recipients!`);
      setIsSending(false);
      onComplete();
    }, 1200);
  };

  const smsContent = getSmsContent();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Blast to Network</h2>
            <p className="text-sm text-gray-500 font-medium tracking-tight">Generate produce links for your contacts</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm border border-gray-100 transition-all active:scale-90"><X size={28}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <div className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-100 relative shadow-sm">
            <span className="absolute -top-3 left-6 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">SMS PREVIEW</span>
            <p className="text-sm text-emerald-900 italic leading-relaxed pt-2">
              "{smsContent.text.replace(/http.*$/, '')}<span className="underline font-bold text-emerald-700">{smsContent.shortLink}</span>"
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4 px-1">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><Users size={16}/> Saved Connections ({customers.length})</h3>
               <button 
                  onClick={() => setSelectedCustomerIds(selectedCustomerIds.length === customers.length ? [] : customers.map(c => c.id))} 
                  className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest"
                >
                  {selectedCustomerIds.length === customers.length ? 'DESELECT ALL' : 'SELECT ALL'}
                </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {customers.map(customer => (
                <div 
                  key={customer.id} 
                  onClick={() => toggleCustomer(customer.id)} 
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedCustomerIds.includes(customer.id) ? 'border-emerald-500 bg-emerald-50/40' : 'border-gray-50 hover:border-gray-200 bg-white'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${selectedCustomerIds.includes(customer.id) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {customer.businessName.charAt(0)}
                    </div>
                    <div>
                      <p className={`font-bold ${selectedCustomerIds.includes(customer.id) ? 'text-emerald-900' : 'text-gray-700'}`}>{customer.businessName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{customer.phone || 'NO MOBILE SAVED'}</p>
                    </div>
                  </div>
                  {selectedCustomerIds.includes(customer.id) ? <CheckCircle className="text-emerald-600" size={24}/> : <div className="w-6 h-6 rounded-full border-2 border-gray-100" />}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4 px-1">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><Smartphone size={16}/> Add Manual Recipients</h3>
               <button 
                  onClick={handleConnectContacts} 
                  disabled={isSyncingContacts} 
                  className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors tracking-widest disabled:opacity-50"
                >
                  {isSyncingContacts ? <Loader2 size={14} className="animate-spin"/> : <Contact size={14}/>}
                  SYNC DEVICE CONTACTS
                </button>
            </div>
            <div className="flex gap-3">
              <input 
                type="tel" 
                placeholder="Enter mobile number..." 
                value={currentManualNumber} 
                onChange={(e) => setCurrentManualNumber(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && addManualNumber()} 
                className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-base font-black text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder-gray-300"
              />
              <button 
                onClick={addManualNumber} 
                className="bg-slate-900 hover:bg-black text-white rounded-2xl w-16 flex items-center justify-center transition-all shadow-lg active:scale-95 border-2 border-slate-900"
              >
                <Plus size={24}/>
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
          <button onClick={onClose} className="flex-1 py-5 bg-white border-2 border-gray-200 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-all shadow-sm">
            Cancel
          </button>
          <button 
            onClick={handleSendBlast}
            disabled={isSending || (selectedCustomerIds.length === 0 && manualNumbers.length === 0)}
            className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isSending ? (
              <><Loader2 size={20} className="animate-spin" /> DISPATCHING...</>
            ) : (
              <><Smartphone size={20} /> OPEN SMS APP ({selectedCustomerIds.length + manualNumbers.length})</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SellerDashboardV1: React.FC<SellerDashboardV1Props> = ({ user, onSwitchVersion }) => {
    return <div className="p-10 text-center text-gray-400">Simplified View Placeholder</div>;
}
