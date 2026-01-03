
import React, { useState, useEffect, useRef } from 'react';
import { User, Product, OrderItem, ProductUnit, UserRole, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { generateEnvironmentalImpact } from '../services/geminiService';
import { 
  ShoppingCart, Search, Plus, X, Leaf, Minus, 
  ArrowRight, ShoppingBag, Trash2, Truck, Calendar, Clock, 
  User as UserIcon, DollarSign, Check, CheckCircle, ChevronDown, Package,
  Sparkles, Loader2, ImagePlus, Wind, Droplets, Recycle, AlertCircle,
  FileWarning, Heart, ChevronRight, CreditCard, FileText, Landmark,
  ShieldCheck, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MarketplaceProps {
  user: User | null;
}

interface CartItem {
    productId: string;
    productName: string;
    price: number;
    qty: number;
    imageUrl: string;
    unit: string;
}

type CheckoutStep = 'REVIEW' | 'LOGISTICS' | 'SETTLEMENT';

const ProductCard: React.FC<any> = ({ product, onAdd, isOutOfStock, isLiked, onToggleLike }) => {
    const [qty, setQty] = useState(1);
    const [unit, setUnit] = useState('KG');
    
    const units = ['KG', 'Tray', '5kg Bag', '10kg Bag', 'Ea'];

    return (
        <div className={`bg-white rounded-[2.5rem] border border-gray-100 p-6 flex flex-col h-full shadow-sm hover:shadow-xl transition-all group relative ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}>
            <button 
                onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
                className={`absolute top-4 right-4 p-2.5 rounded-full transition-all active:scale-90 z-10 ${isLiked ? 'bg-red-50 text-red-500 shadow-md' : 'bg-gray-50 text-gray-300 hover:text-red-400'}`}
            >
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            </button>

            <div className="mb-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden mb-3 border border-gray-100">
                    <img src={product.imageUrl} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl text-gray-900 font-black uppercase tracking-tight leading-none mb-1">{product.name}</h3>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">{product.variety}</p>
                <div className="flex flex-col gap-2 mt-2">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Wind size={12}/> Saves {product.co2SavingsPerKg?.toFixed(1) || '0.8'}kg CO2
                    </p>
                </div>
            </div>

            <div className="mt-auto space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Purchase Unit</label>
                    <div className="relative group">
                        <Package size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-focus-within:text-emerald-500 transition-colors"/>
                        <select 
                            className="w-full pl-9 pr-8 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-xs text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all appearance-none"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                        >
                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"/>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-2">
                    <div className="flex-1 flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/50 h-11">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><Minus size={14} strokeWidth={3}/></button>
                        <span className="flex-1 text-center font-black text-sm text-gray-900">{qty}</span>
                        <button onClick={() => setQty(qty + 1)} className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><Plus size={14} strokeWidth={3}/></button>
                    </div>
                </div>

                <button 
                    onClick={() => onAdd(qty, unit)} 
                    disabled={isOutOfStock} 
                    className="w-full py-4 bg-[#043003] text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Plus size={16}/> Add to Cart
                </button>
            </div>
        </div>
    );
};

export const Marketplace: React.FC<MarketplaceProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isOnboardingPending, setIsOnboardingPending] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<Customer | null>(null);
  
  // Checkout States
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('REVIEW');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAgreementConfirmed, setIsAgreementConfirmed] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState({
      deliveryDate: '',
      deliveryTime: '06:00am - 08:00am',
      contactName: user?.name || '',
      paymentMethod: 'invoice' as 'pay_now' | 'invoice'
  });

  const dateInputRef = useRef<HTMLInputElement>(null);

  const timeSlots = [
    '06:00am - 08:00am',
    '08:00am - 10:00am',
    '10:00am - 12:00pm',
    '12:00pm - 02:00pm',
    '02:00pm - 04:00pm'
  ];

  useEffect(() => {
    const load = () => {
        setProducts(mockService.getAllProducts());
        if (user) {
            setIsBlocked(mockService.hasOutstandingInvoices(user.id));
            setIsOnboardingPending(!user.businessProfile?.isComplete);
            setCheckoutDetails(prev => ({ ...prev, contactName: user.name }));
            
            const profile = mockService.getCustomers().find(c => c.id === user.id);
            if (profile) setCustomerProfile(profile);
        }
    };
    load();
  }, [user]);

  const addToCart = (product: Product, qty: number, unit: string) => {
      setCart(prev => {
          const existing = prev.find(i => i.productId === product.id && i.unit === unit);
          if (existing) return prev.map(i => (i.productId === product.id && i.unit === unit) ? { ...i, qty: i.qty + qty } : i);
          
          return [...prev, { 
              productId: product.id, 
              productName: product.name, 
              price: product.defaultPricePerKg, 
              qty, 
              imageUrl: product.imageUrl,
              unit: unit
          }];
      });
  };

  const updateCartQty = (productId: string, unit: string, delta: number) => {
      setCart(prev => prev.map(item => 
          (item.productId === productId && item.unit === unit) 
            ? { ...item, qty: Math.max(0, item.qty + delta) } 
            : item
      ).filter(item => item.qty > 0));
  };

  const handleToggleLike = (productId: string) => {
      if (!user) return;
      mockService.toggleFavorite(user.id, productId);
      setProducts([...mockService.getAllProducts()]);
  };

  const handlePlaceOrder = async () => {
      if (!user) return alert("Please sign in.");
      if (isOnboardingPending) return alert("Please complete your business profile before trading.");
      if (!checkoutDetails.deliveryDate || !checkoutDetails.contactName) {
          alert("Please complete delivery date and receiver name.");
          return;
      }
      if (!isAgreementConfirmed) {
          alert("Please confirm the trading agreement check before placing your order.");
          return;
      }

      setIsProcessingPayment(true);

      // Simulate order processing delay
      await new Promise(r => setTimeout(r, 1500));

      const orderItems = cart.map(i => ({ productId: i.productId, quantityKg: i.qty, pricePerKg: i.price, unit: i.unit as any }));
      const subtotal = cart.reduce((sum, i) => sum + (i.qty * i.price), 0);
      const finalTotal = subtotal; 
      
      const newOrder = mockService.createFullOrder(user.id, orderItems, finalTotal);
      newOrder.logistics = {
          deliveryLocation: user.businessName,
          deliveryTime: checkoutDetails.deliveryTime,
          deliveryDate: checkoutDetails.deliveryDate,
          instructions: `Contact: ${checkoutDetails.contactName}`
      };
      newOrder.paymentMethod = 'invoice';

      setIsProcessingPayment(false);
      setCart([]); 
      setCheckoutStep('REVIEW');
      
      alert("Thank you for your order, please track your order in your portal"); 
      navigate('/orders');
  };

  const triggerDatePicker = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent div from double-triggering
    e.stopPropagation();
    if (dateInputRef.current) {
        try {
            // Standard method for showing native pickers
            (dateInputRef.current as any).showPicker();
        } catch (err) {
            // Fallback for older browsers
            dateInputRef.current.click();
            dateInputRef.current.focus();
        }
    }
  };

  const showCart = cart.length > 0;

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden -mx-8 -mt-8 animate-in fade-in duration-500 bg-[#F8FAFC]">
        {/* MAIN CATALOG SECTION */}
        <div className={`overflow-y-auto p-8 custom-scrollbar transition-all duration-500 ${showCart ? 'lg:w-[60%] w-full' : 'w-full'}`}>
            <div className="space-y-12 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-center text-[#043003]"><ShoppingBag size={36} /></div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Fresh Market</h1>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Source Direct • No Markup</p>
                        </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-96 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search varieties..." 
                                className="w-full pl-14 pr-8 py-5 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-100 transition-all" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {['ALL', 'VEGETABLES', 'FRUIT'].map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setActiveCategory(cat)} 
                            className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-[#043003] text-white border-[#043003] shadow-lg scale-105 z-10' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className={`grid gap-6 ${showCart ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                    {products.filter(p => (activeCategory === 'ALL' || p.category.toString().toUpperCase() === activeCategory) && p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                        <ProductCard 
                            key={p.id} 
                            product={p} 
                            isLiked={user?.favoriteProductIds?.includes(p.id)}
                            onToggleLike={() => handleToggleLike(p.id)}
                            onAdd={(qty: number, unit: string) => addToCart(p, qty, unit)} 
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* SIDE CART SPLIT SECTION */}
        {showCart && (
            <div className="lg:w-[40%] w-full bg-white border-l border-gray-100 shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-500 z-50">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Your Cart</h2>
                            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1.5">Step {checkoutStep === 'REVIEW' ? '1' : checkoutStep === 'LOGISTICS' ? '2' : '3'} of 3</p>
                        </div>
                    </div>
                    <button onClick={() => { setCart([]); setCheckoutStep('REVIEW'); }} className="text-gray-400 hover:text-red-500 transition-colors p-2 bg-white rounded-full border border-gray-100 shadow-sm"><Trash2 size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* STEP 1: REVIEW CART */}
                    {checkoutStep === 'REVIEW' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Selected Produce</p>
                            <div className="space-y-4">
                                {cart.map((item, idx) => (
                                    <div key={`${item.productId}-${item.unit}`} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 group hover:border-indigo-200 transition-all">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-50 bg-gray-100 shrink-0">
                                            <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-gray-900 text-sm uppercase truncate leading-none mb-1.5">{item.productName}</h4>
                                            <div className="flex items-center gap-4 mt-3">
                                                <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/50">
                                                    <button onClick={() => updateCartQty(item.productId, item.unit, -1)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Minus size={12} strokeWidth={4}/></button>
                                                    <span className="w-8 text-center font-black text-xs text-gray-900">{item.qty}</span>
                                                    <button onClick={() => updateCartQty(item.productId, item.unit, 1)} className="p-1 text-gray-400 hover:text-emerald-500 transition-colors"><Plus size={12} strokeWidth={4}/></button>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.unit}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: LOGISTICS */}
                    {checkoutStep === 'LOGISTICS' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="space-y-6">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Logistics & Identity</p>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Authorized Buyer Name</label>
                                        <div className="relative group">
                                            <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors"/>
                                            <input 
                                                placeholder="Who's placing the order?"
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-xs text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50/5 transition-all"
                                                value={checkoutDetails.contactName}
                                                onChange={e => setCheckoutDetails({...checkoutDetails, contactName: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Delivery Date</label>
                                            <div 
                                                className="relative group cursor-pointer" 
                                                onClick={triggerDatePicker}
                                            >
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-indigo-500 transition-colors pointer-events-none z-10">
                                                    <Calendar size={18}/>
                                                </div>
                                                <input 
                                                    ref={dateInputRef}
                                                    type="date"
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-xs text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50/5 transition-all cursor-pointer block"
                                                    value={checkoutDetails.deliveryDate}
                                                    onChange={e => setCheckoutDetails({...checkoutDetails, deliveryDate: e.target.value})}
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1 pointer-events-none">
                                                    Open Calendar <ChevronRight size={12}/>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Time Slot</label>
                                            <div className="relative group">
                                                <Clock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors"/>
                                                <select 
                                                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-xs text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50/5 transition-all appearance-none"
                                                    value={checkoutDetails.deliveryTime}
                                                    onChange={e => setCheckoutDetails({...checkoutDetails, deliveryTime: e.target.value})}
                                                >
                                                    {timeSlots.map(slot => (
                                                        <option key={slot} value={slot}>{slot}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SETTLEMENT */}
                    {checkoutStep === 'SETTLEMENT' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Settlement Method</p>
                            <div className="w-full p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-start gap-4 relative bg-indigo-600 border-indigo-600 text-white shadow-2xl">
                                <FileText size={32} />
                                <div>
                                    <span className="text-xl font-black uppercase tracking-widest block">NET {customerProfile?.pzPaymentTermsDays || 7} INVOICE</span>
                                    <span className="text-[10px] font-bold uppercase opacity-70">Pre-approved B2B Trading Facility</span>
                                </div>
                                <CheckCircle size={24} className="absolute top-6 right-6 text-white" />
                            </div>
                            
                            {/* Confirmation Requirement */}
                            <div 
                                onClick={() => setIsAgreementConfirmed(!isAgreementConfirmed)}
                                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-4 ${isAgreementConfirmed ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'bg-white border-gray-100 hover:border-indigo-100 group'}`}
                            >
                                <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${isAgreementConfirmed ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-gray-50 border-gray-200 text-transparent'}`}>
                                    <Check size={16} strokeWidth={4}/>
                                </div>
                                <p className={`text-xs font-black uppercase tracking-tight ${isAgreementConfirmed ? 'text-emerald-900' : 'text-gray-500 group-hover:text-indigo-600'}`}>
                                    Confirm order details & terms
                                </p>
                            </div>

                            <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-start gap-4">
                                <Info size={20} className="text-indigo-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-indigo-800 font-medium leading-relaxed">
                                    Your account is configured for standard credit terms. Upon confirming, this trade will be logged and the goods dispatched according to your selected logistics window.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER ACTIONS */}
                <div className="p-8 border-t border-gray-100 bg-gray-50/50 space-y-6 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] shrink-0">
                    <div className="flex gap-3">
                        {checkoutStep === 'REVIEW' ? (
                            <button 
                                onClick={() => setCheckoutStep('LOGISTICS')}
                                className="w-full py-6 bg-[#043003] hover:bg-black text-white rounded-[1.75rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-emerald-900/10 transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
                            >
                                Proceed to Order <ChevronRight size={20} strokeWidth={3}/>
                            </button>
                        ) : checkoutStep === 'LOGISTICS' ? (
                            <>
                                <button 
                                    onClick={() => setCheckoutStep('REVIEW')}
                                    className="px-6 py-5 bg-white border border-gray-200 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all"
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={() => setCheckoutStep('SETTLEMENT')}
                                    disabled={!checkoutDetails.deliveryDate}
                                    className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    Review Settlement Terms <ChevronRight size={20}/>
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => setCheckoutStep('LOGISTICS')}
                                    disabled={isProcessingPayment}
                                    className="px-6 py-5 bg-white border border-gray-200 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all"
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessingPayment || !isAgreementConfirmed}
                                    className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-[0.25em] text-xs shadow-2xl shadow-emerald-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isProcessingPayment ? (
                                        <><Loader2 className="animate-spin" size={20}/> Submitting...</>
                                    ) : (
                                        <><Check size={20} strokeWidth={4}/> Confirm & Trade</>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
