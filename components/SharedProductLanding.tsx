
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Product, InventoryItem } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  ArrowLeft, ShoppingCart, MessageSquare, CheckCircle, 
  Store, MapPin, Leaf, ShieldCheck, Star, Info, Loader2, ChevronRight
} from 'lucide-react';
import { ChatDialog } from './ChatDialog';

export const SharedProductLanding: React.FC<{ user: User | null, onLogin: () => void }> = ({ user, onLogin }) => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [wholesaler, setWholesaler] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Interaction states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchDetails = () => {
      setLoading(true);
      // Try to find the inventory lot (item) first
      const allInv = mockService.getAllInventory();
      // Since some IDs might be mock IDs like 'inv-ai-...' we check thoroughly
      const foundItem = allInv.find(i => i.id === itemId || i.lotNumber === itemId);
      
      if (foundItem) {
        setItem(foundItem);
        const p = mockService.getProduct(foundItem.productId);
        setProduct(p || null);
        const w = mockService.getAllUsers().find(u => u.id === foundItem.ownerId);
        setWholesaler(w || null);
      }
      setLoading(false);
    };

    fetchDetails();
  }, [itemId]);

  const handlePurchase = () => {
    if (!user) {
      onLogin();
      return;
    }
    setAddingToCart(true);
    // Simulate navigation to marketplace with item pre-selected or added
    setTimeout(() => {
      setAddingToCart(false);
      alert(`Success! ${product?.name} added to your active cart.`);
      navigate('/marketplace');
    }, 800);
  };

  const handleChat = () => {
    if (!user) {
      onLogin();
      return;
    }
    setIsChatOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 size={48} className="animate-spin text-emerald-600 mb-4" />
        <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Accessing Market Lot...</p>
      </div>
    );
  }

  if (!item || !product || !wholesaler) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-center text-gray-300 mb-6">
            <ShoppingCart size={40} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Market Lot Not Found</h1>
        <p className="text-gray-500 max-w-xs mb-8">The shared product link may have expired or the stock has been fulfilled.</p>
        <button onClick={() => navigate('/')} className="px-8 py-4 bg-[#043003] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Browse Live Market</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Mobile Top Nav */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold">P</div>
           <span className="font-black text-sm tracking-tight text-gray-900 uppercase">Platform Zero</span>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-10">
        
        {/* Product Visual & Identity */}
        <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-full md:w-1/2 h-[400px] md:h-auto bg-gray-100">
                <img src={item.batchImageUrl || product.imageUrl} className="w-full h-full object-cover" alt={product.name}/>
            </div>
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100">Live Fresh Lot</span>
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-100">{product.variety}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-4">{product.name}</h1>
                    <p className="text-gray-500 font-medium text-lg leading-relaxed mb-8">Premium quality produce sourced directly from the Platform Zero network. Verified for freshness and sustainability.</p>
                    
                    <div className="flex items-center gap-6 mb-10">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trade Price</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-emerald-600 tracking-tighter">${product.defaultPricePerKg.toFixed(2)}</span>
                                <span className="text-sm font-black text-gray-400 uppercase">/ {product.unit || 'kg'}</span>
                            </div>
                        </div>
                        <div className="w-px h-12 bg-gray-100"></div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Availability</span>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">{item.quantityKg}{product.unit || 'kg'}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button 
                        onClick={handlePurchase}
                        disabled={addingToCart}
                        className="w-full py-5 bg-[#043003] hover:bg-black text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        {addingToCart ? <Loader2 size={24} className="animate-spin" /> : <><ShoppingCart size={20}/> Purchase Product</>}
                    </button>
                    <button 
                        onClick={handleChat}
                        className="w-full py-5 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                    >
                        <MessageSquare size={20}/> Chat to Supplier
                    </button>
                </div>
            </div>
        </div>

        {/* Wholesaler / Origin Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-[1.75rem] flex items-center justify-center text-indigo-600 shadow-inner-sm shrink-0 border border-indigo-100/50">
                    <Store size={36} />
                </div>
                <div>
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Direct Wholesaler</span>
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">{wholesaler.businessName}</h3>
                    <div className="flex items-center gap-2 mt-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        <MapPin size={12} /> Pooraka Produce Market, SA
                    </div>
                </div>
            </div>

            <div className="bg-emerald-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden flex items-center gap-6 group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform rotate-12 scale-150 pointer-events-none group-hover:rotate-0 transition-transform duration-700"><Leaf size={100}/></div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/20 shrink-0">
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-1">Sustainability Verified</h3>
                    <p className="text-xs text-emerald-50 font-medium leading-relaxed">This lot saves <span className="font-black">{(item.quantityKg * 0.8).toFixed(0)}kg</span> of CO2 by bypassing traditional retail hubs.</p>
                </div>
            </div>
        </div>

        {/* Extra Context / Why Platform Zero */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Star size={20}/></div>
                    <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">Source Direct</h4>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">Bypass the markups of middlemen. We connect you directly to the market floor.</p>
                </div>
                <div className="space-y-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><CheckCircle size={20}/></div>
                    <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">Quality Audit</h4>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">Every shared lot undergoes a visual AI quality check before being listed.</p>
                </div>
                <div className="space-y-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Info size={20}/></div>
                    <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">Unified Billing</h4>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">Purchase from 10 suppliers, pay one Platform Zero invoice on 7-day terms.</p>
                </div>
            </div>
        </div>

        {/* Not Logged In Footnote */}
        {!user && (
            <div className="text-center pt-8">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <Lock size={12}/> Safe & Secure B2B Trade Portal
                </p>
            </div>
        )}
      </div>

      {isChatOpen && user && (
          <ChatDialog 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
            orderId="INQUIRY-EXTERNAL" 
            issueType={`Lot Inquiry: ${product.name} @ $${product.defaultPricePerKg.toFixed(2)}`} 
            repName={wholesaler.businessName}
          />
      )}
    </div>
  );
};

const Lock = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
