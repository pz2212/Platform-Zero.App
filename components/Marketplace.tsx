import React, { useState, useEffect, useRef } from 'react';
import { User, Product, OrderItem, ProductUnit, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { generateEnvironmentalImpact } from '../services/geminiService';
import { 
  ShoppingCart, Search, Plus, X, Leaf, Minus, 
  ArrowRight, ShoppingBag, Trash2, Truck, Calendar, Clock, 
  User as UserIcon, DollarSign, Check, CheckCircle, ChevronDown, Package,
  Sparkles, Loader2, ImagePlus, Wind, Droplets, Recycle, AlertCircle
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

const AddProductModal = ({ isOpen, onClose, onComplete }: { 
    isOpen: boolean, 
    onClose: () => void, 
    onComplete: () => void 
}) => {
    const [image, setImage] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [variety, setVariety] = useState('');
    const [category, setCategory] = useState<'Vegetable' | 'Fruit'>('Vegetable');
    const [isSaving, setIsSaving] = useState(false);
    const [impactLoading, setImpactLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setImage(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setImpactLoading(true);
        
        // Generate Environmental Impact via AI
        const impact = await generateEnvironmentalImpact(name, variety || 'Standard');
        
        const newProd: Product = {
            id: `p-man-${Date.now()}`,
            name,
            variety: variety || 'Standard',
            category,
            imageUrl: image || 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400&h=400',
            defaultPricePerKg: 2.50, // Default fallback price as requested removed from input
            co2SavingsPerKg: impact.co2,
            waterSavingsPerKg: impact.water,
            wasteDivertedPerKg: impact.waste
        };

        mockService.addProduct(newProd);

        setTimeout(() => {
            setImpactLoading(false);
            setIsSaving(false);
            onComplete();
            onClose();
            setName('');
            setVariety('');
            setImage(null);
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight uppercase">Add New Product</h2>
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mt-1">Direct Market Catalog Creation</p>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 transition-colors p-2 bg-white rounded-full border border-gray-100 shadow-sm">
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`h-48 border-4 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden bg-white shadow-inner-sm ${image ? 'border-emerald-300 shadow-none' : 'border-gray-100 hover:border-indigo-300 hover:bg-gray-50/50'}`}
                    >
                        {image ? (
                            <img src={image} className="w-full h-full object-cover" alt="Preview"/>
                        ) : (
                            <div className="text-center">
                                <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm">
                                    <ImagePlus size={32} strokeWidth={2.5}/>
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-1">Upload Catalog Image</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hi-Res JPEG or PNG</p>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange}/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Produce Name</label>
                            <input required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all" placeholder="e.g. Heirloom Carrots" value={name} onChange={e => setName(e.target.value)}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Variety</label>
                            <input required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm text-gray-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-gray-300" placeholder="e.g. Nantes" value={variety} onChange={e => setVariety(e.target.value)}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                            <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:bg-white transition-all appearance-none" value={category} onChange={e => setCategory(e.target.value as any)}>
                                <option value="Vegetable">Vegetable</option>
                                <option value="Fruit">Fruit</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/50 flex items-start gap-4">
                        <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm shrink-0">
                            <Wind size={24}/>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-900 uppercase tracking-tight">AI Impact Calculation</p>
                            <p className="text-[11px] text-emerald-700 font-medium leading-relaxed mt-1">
                                Platform Zero AI will automatically calculate specific CO2, Water, and Waste diversion metrics for this variety upon creation.
                            </p>
                        </div>
                    </div>

                    <button 
                        disabled={isSaving || !name}
                        className="w-full py-5 bg-[#043003] hover:bg-black text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 overflow-hidden"
                    >
                        {isSaving ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="animate-spin" size={24}/>
                                {impactLoading ? "Analyzing Impact..." : "Finalizing Catalog Entry..."}
                            </div>
                        ) : (
                            <><Sparkles size={20}/> Add to Global Catalog</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

const CheckoutModal = ({ isOpen, onClose, cart, products, onPlaceOrder, isBlocked }: { 
    isOpen: boolean, 
    onClose: () => void, 
    cart: CartItem[], 
    products: Product[],
    onPlaceOrder: (details: any) => void,
    isBlocked: boolean
}) => {
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [contactName, setContactName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'pay_now' | 'invoice'>('invoice');

    if (!isOpen) return null;

    const subtotal = cart.reduce((sum, i) => sum + (i.qty * i.price), 0);
    const discount = paymentMethod === 'pay_now' ? subtotal * 0.1 : 0;
    const total = subtotal - discount;

    const handleSubmit = () => {
        if (isBlocked) return;
        if (!deliveryDate || !contactName) {
            alert("Please complete delivery information and contact name.");
            return;
        }
        onPlaceOrder({
            items: cart.map(i => ({ productId: i.productId, quantityKg: i.qty, pricePerKg: i.price, unit: i.unit })),
            total,
            deliveryDate,
            deliveryTime,
            contactName,
            paymentMethod
        });
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95">
                <div className="w-full md:w-[320px] bg-[#F8FAFC] border-r border-gray-100 p-10 flex flex-col">
                    <div className="flex items-center gap-3 mb-10">
                        <ShoppingCart size={24} className="text-gray-900" />
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Order Summary</h2>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar mb-10">
                        {cart.map((item, idx) => (
                            <div key={`${item.productId}-${idx}`} className="flex justify-between items-start">
                                <div>
                                    <p className="font-black text-gray-900 uppercase text-sm leading-tight">{item.productName}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                        {item.qty} x {item.unit}
                                    </p>
                                </div>
                                <span className="font-black text-gray-900 text-sm">${(item.qty * item.price).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 pt-8 border-t border-gray-200">
                        <div className="flex justify-between items-center text-gray-500 font-bold text-sm">
                            <span className="uppercase tracking-widest text-[11px]">Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between items-center text-emerald-600 font-bold text-sm">
                                <span className="uppercase tracking-widest text-[11px]">Instant Discount (10%)</span>
                                <span>-${discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-end pt-2">
                            <span className="font-black text-gray-900 text-xl uppercase tracking-tighter leading-none">Total</span>
                            <span className="font-black text-gray-900 text-4xl tracking-tighter leading-none">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-white p-10 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Checkout Details</h2>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-2">Logistics & Payment Config</p>
                        </div>
                        <button onClick={onClose} className="text-gray-300 hover:text-gray-900 transition-colors">
                            <X size={32} />
                        </button>
                    </div>

                    {isBlocked && (
                        <div className="mb-10 bg-red-50 border-2 border-red-100 rounded-3xl p-6 flex items-start gap-5 animate-bounce">
                            <div className="bg-red-500 text-white p-3 rounded-2xl shadow-lg">
                                <AlertCircle size={28}/>
                            </div>
                            <div>
                                <p className="text-sm font-black text-red-900 uppercase tracking-tight">Account Restricted</p>
                                <p className="text-xs text-red-700 font-medium leading-relaxed mt-1">
                                    Trading is disabled due to an <span className="font-black">outstanding invoice</span>. Please settle your account to continue ordering.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-10 flex-1">
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Truck size={14}/> DELIVERY INFORMATION
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 ml-1">Delivery Date</label>
                                    <div className="relative">
                                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                                        <input 
                                            type="date" 
                                            disabled={isBlocked}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all disabled:opacity-50"
                                            value={deliveryDate}
                                            onChange={e => setDeliveryDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 ml-1">Delivery Time</label>
                                    <div className="relative">
                                        <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                                        <input 
                                            type="time" 
                                            disabled={isBlocked}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all disabled:opacity-50"
                                            value={deliveryTime}
                                            onChange={e => setDeliveryTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 ml-1">Who made the order?</label>
                                <div className="relative">
                                    <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                                    <input 
                                        disabled={isBlocked}
                                        placeholder="Contact Name"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all disabled:opacity-50"
                                        value={contactName}
                                        onChange={e => setContactName(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <DollarSign size={14}/> PAYMENT METHOD
                            </h3>
                            <div className="space-y-3">
                                <button 
                                    disabled={isBlocked}
                                    onClick={() => setPaymentMethod('pay_now')}
                                    className={`w-full p-6 rounded-3xl border-2 transition-all text-left flex items-center justify-between group disabled:opacity-50 ${paymentMethod === 'pay_now' ? 'border-[#043003] bg-emerald-50/20' : 'border-gray-50 bg-[#F8FAFC] hover:border-gray-200'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'pay_now' ? 'border-[#043003] bg-[#043003] text-white' : 'border-gray-300'}`}>
                                            {paymentMethod === 'pay_now' && <Check size={14} strokeWidth={4}/>}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 uppercase text-sm leading-none">Pay Now</p>
                                            <p className="text-[11px] text-gray-400 font-bold mt-1.5 uppercase tracking-widest">Instant credit card payment</p>
                                        </div>
                                    </div>
                                    <span className="bg-[#D1FAE5] text-[#065F46] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-[#A7F3D0]">Save 10%</span>
                                </button>

                                <button 
                                    disabled={isBlocked}
                                    onClick={() => setPaymentMethod('invoice')}
                                    className={`w-full p-6 rounded-3xl border-2 transition-all text-left flex items-center group disabled:opacity-50 ${paymentMethod === 'invoice' ? 'border-[#043003] bg-emerald-50/20' : 'border-gray-50 bg-[#F8FAFC] hover:border-gray-200'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'invoice' ? 'border-[#043003] bg-[#043003] text-white' : 'border-gray-300'}`}>
                                            {paymentMethod === 'invoice' && <Check size={14} strokeWidth={4}/>}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 uppercase text-sm leading-none">Invoice</p>
                                            <p className="text-[11px] text-gray-400 font-bold mt-1.5 uppercase tracking-widest">Standard 7-day terms</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 flex gap-4">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-5 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={isBlocked}
                            className="flex-[2] py-5 bg-[#043003] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                        >
                            <Check size={20}/> Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductCard: React.FC<any> = ({ product, onAdd, isOutOfStock }) => {
    const [qty, setQty] = useState(1);
    const [unit, setUnit] = useState('KG');
    
    const units = ['KG', 'Tray', '5kg Bag', '10kg Bag', 'Ea'];

    return (
        <div className={`bg-white rounded-[2.5rem] border border-gray-100 p-10 flex flex-col h-full shadow-sm hover:shadow-xl transition-all group ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}>
            <div className="mb-8">
                <h3 className="text-2xl text-gray-900 font-black uppercase tracking-tight leading-none mb-1">{product.name}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{product.variety}</p>
                <div className="flex flex-col gap-2 mt-4">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Wind size={14}/> Saves {product.co2SavingsPerKg?.toFixed(1) || '0.8'}kg CO2/kg
                    </p>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Droplets size={14}/> Saves {product.waterSavingsPerKg?.toFixed(0) || '50'}L Water/kg
                    </p>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Recycle size={14}/> {product.wasteDivertedPerKg?.toFixed(1) || '1.0'}kg Diverted/kg
                    </p>
                </div>
            </div>

            <div className="mt-auto space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Purchase Unit</label>
                    <div className="relative group">
                        <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-focus-within:text-emerald-500 transition-colors"/>
                        <select 
                            className="w-full pl-11 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all appearance-none"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                        >
                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"/>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-4">
                    <div className="flex-1 flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200/50 h-14">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><Minus size={18} strokeWidth={3}/></button>
                        <span className="flex-1 text-center font-black text-lg text-gray-900">{qty}</span>
                        <button onClick={() => setQty(qty + 1)} className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><Plus size={18} strokeWidth={3}/></button>
                    </div>
                </div>

                <button 
                    onClick={() => onAdd(qty, unit)} 
                    disabled={isOutOfStock} 
                    className="w-full py-5 bg-[#043003] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    <Plus size={18}/> Add to Cart
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
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const canAddProducts = user?.role === UserRole.ADMIN || user?.role === UserRole.WHOLESALER || user?.role === UserRole.FARMER;

  useEffect(() => {
    const load = () => {
        setProducts(mockService.getAllProducts());
        if (user) {
            setIsBlocked(mockService.hasOutstandingInvoices(user.id));
        }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
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

  const handlePlaceOrder = (details: any) => {
      if (!user) return alert("Please sign in.");
      if (isBlocked) return;

      const newOrder = mockService.createFullOrder(user.id, details.items, details.total);
      newOrder.logistics = {
          deliveryLocation: user.businessName,
          deliveryTime: details.deliveryTime,
          deliveryDate: details.deliveryDate,
          instructions: `Order placed by ${details.contactName}`
      };
      newOrder.paymentMethod = details.paymentMethod;
      
      setCart([]); 
      setIsCheckoutOpen(false); 
      alert("Order Placed Successfully!"); 
      navigate('/orders');
  };

  const CATEGORIES = ['ALL', 'VEGETABLES', 'FRUIT'];
  const filtered = products.filter(p => (activeCategory === 'ALL' || p.category.toString().toUpperCase() === activeCategory) && p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-12 relative pb-24 animate-in fade-in duration-500">
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
                {canAddProducts && (
                    <button 
                        onClick={() => setIsAddProductModalOpen(true)}
                        className="px-6 bg-white text-emerald-600 border-2 border-emerald-600 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Plus size={20}/> ADD PRODUCT
                    </button>
                )}
                <button 
                    onClick={() => setIsCheckoutOpen(true)} 
                    disabled={cart.length === 0}
                    className="relative px-6 bg-[#043003] text-white border border-[#043003] rounded-[1.5rem] shadow-xl hover:bg-black transition-all disabled:bg-white disabled:text-gray-200 disabled:border-gray-50 disabled:shadow-none active:scale-95 flex items-center justify-center"
                >
                    <ShoppingCart size={28}/>
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[11px] font-black w-7 h-7 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-in zoom-in">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>
        </div>

        {isBlocked && (
            <div className="bg-red-50 border-2 border-red-100 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-sm animate-in slide-in-from-top-4">
                <div className="bg-red-500 p-4 rounded-2xl text-white shadow-lg shadow-red-200 animate-pulse">
                    <AlertCircle size={32}/>
                </div>
                <div>
                    <h3 className="font-black text-red-900 uppercase tracking-tight text-xl">Account Restricted</h3>
                    <p className="text-red-700 font-medium leading-relaxed max-w-2xl">
                        Ordering is currently disabled for this profile because you have <span className="font-black">outstanding invoices</span>. Please head to your <span className="font-black underline cursor-pointer" onClick={() => navigate('/accounts')}>Accounts Center</span> to settle the balance.
                    </p>
                </div>
            </div>
        )}

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES.map(cat => (
                <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)} 
                    className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-[#043003] text-white border-[#043003] shadow-lg scale-105 z-10' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}
                >
                    {cat}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map(p => (
                <ProductCard 
                    key={p.id} 
                    product={p} 
                    onAdd={(qty: number, unit: string) => addToCart(p, qty, unit)} 
                />
            ))}
        </div>

        <CheckoutModal 
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cart={cart}
            products={products}
            onPlaceOrder={handlePlaceOrder}
            isBlocked={isBlocked}
        />

        <AddProductModal 
            isOpen={isAddProductModalOpen}
            onClose={() => setIsAddProductModalOpen(false)}
            onComplete={() => setProducts(mockService.getAllProducts())}
        />
    </div>
  );
};
