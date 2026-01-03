import React, { useState, useEffect, useMemo } from 'react';
import { User, Order, Product, ParsedOrderItem, OrderItem } from '../types';
import { mockService } from '../services/mockDataService';
import { parseNaturalLanguageOrder } from '../services/geminiService';
import { 
  DollarSign, ShoppingBag, Truck, MapPin, 
  CheckCircle, Clock, Package, Leaf, ArrowRight, Search,
  X, Loader2, Check, Sparkles, ShoppingCart, AlertTriangle,
  ChevronRight, Minus, Plus, RefreshCcw, Calendar, Edit3, 
  User as UserIcon, LayoutGrid, BookOpen, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConsumerDashboardProps {
  user: User;
}

const CheckoutModal = ({ isOpen, onClose, items, products, onPlaceOrder, isBlocked }: { 
    isOpen: boolean, 
    onClose: () => void, 
    items: OrderItem[], 
    products: Product[],
    onPlaceOrder: (details: any) => void,
    isBlocked: boolean
}) => {
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [contactName, setContactName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'pay_now' | 'invoice'>('invoice');

    if (!isOpen) return null;

    const subtotal = items.reduce((sum, i) => sum + (i.quantityKg * i.pricePerKg), 0);
    const discount = paymentMethod === 'pay_now' ? subtotal * 0.1 : 0;
    const total = subtotal - discount;

    const handleSubmit = () => {
        if (isBlocked) return;
        if (!deliveryDate || !contactName) {
            alert("Please complete delivery information and contact name.");
            return;
        }
        onPlaceOrder({
            items,
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

                    <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pr-2 mb-10">
                        {items.map((item, idx) => {
                            const p = products.find(prod => prod.id === item.productId);
                            return (
                                <div key={idx} className="flex justify-between items-start">
                                    <div>
                                        <p className="font-black text-gray-900 uppercase text-sm leading-tight">{p?.name || 'Item'}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            {item.quantityKg}{p?.unit || 'kg'} @ ${item.pricePerKg.toFixed(2)}
                                        </p>
                                    </div>
                                    <span className="font-black text-gray-900 text-sm">${(item.quantityKg * item.pricePerKg).toFixed(2)}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-4 pt-8 border-t border-gray-200">
                        <div className="flex justify-between items-center text-gray-500 font-bold text-sm">
                            <span className="uppercase tracking-widest text-[11px]">Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between items-center text-emerald-600 font-bold text-sm">
                                <span className="uppercase tracking-widest text-[11px]">Payment Discount (10%)</span>
                                <span>-${discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-end pt-2">
                            <span className="font-black text-gray-900 text-xl uppercase tracking-tighter leading-none">Total</span>
                            <span className="font-black text-gray-900 text-3xl tracking-tighter leading-none">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-white p-10 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Checkout Details</h2>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-2">Logistics & Settlement Config</p>
                        </div>
                        <button onClick={onClose} className="text-gray-300 hover:text-gray-900 transition-colors">
                            <X size={32} />
                        </button>
                    </div>

                    {isBlocked && (
                        <div className="mb-10 bg-red-50 border-2 border-red-100 rounded-3xl p-6 flex items-start gap-5 animate-pulse">
                            <div className="bg-red-500 text-white p-3 rounded-2xl shadow-lg">
                                <AlertCircle size={28}/>
                            </div>
                            <div>
                                <p className="text-sm font-black text-red-900 uppercase tracking-tight">Account Restricted</p>
                                <p className="text-xs text-red-700 font-medium leading-relaxed mt-1">
                                    Trading is disabled due to an <span className="font-black">outstanding invoice</span>. Please settle your account to continue.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-10 flex-1">
                        <div>
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Truck size={14}/> DELIVERY INFORMATION
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 ml-1">Delivery Date</label>
                                    <div className="relative">
                                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                                        <input 
                                            type="date" 
                                            disabled={isBlocked}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50/5 focus:bg-white transition-all disabled:opacity-50"
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
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50/5 focus:bg-white transition-all disabled:opacity-50"
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
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50/5 focus:bg-white transition-all disabled:opacity-50"
                                        value={contactName}
                                        onChange={e => setContactName(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
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

                    <div className="pt-10 flex gap-4">
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

const AiQuickOrder = ({ onItemsConfirmed, catalog, isBlocked }: { onItemsConfirmed: (items: OrderItem[]) => void, catalog: Product[], isBlocked: boolean }) => {
    const [text, setText] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [reviewItems, setReviewItems] = useState<ParsedOrderItem[] | null>(null);

    const handleParse = async () => {
        if (!text.trim() || isBlocked) return;
        setIsParsing(true);
        try {
            const parsed = await parseNaturalLanguageOrder(text, catalog);
            setReviewItems(parsed);
        } catch (e) {
            alert("Sorry, I couldn't understand that order. Please try again.");
        } finally {
            setIsParsing(false);
        }
    };

    const handleUpdateItem = (idx: number, updates: Partial<ParsedOrderItem>) => {
        if (!reviewItems) return;
        const newItems = [...reviewItems];
        newItems[idx] = { ...newItems[idx], ...updates };
        setReviewItems(newItems);
    };

    const handleFinalConfirm = () => {
        if (!reviewItems || isBlocked) return;
        
        const hasAmbiguity = reviewItems.some(i => i.isAmbiguous && !i.selectedProductId);
        if (hasAmbiguity) {
            alert("Please select a specific variety for the highlighted items before adding to cart.");
            return;
        }

        const itemsToCheckout: OrderItem[] = reviewItems.map(ri => {
            const p = catalog.find(cat => cat.id === ri.selectedProductId);
            return {
                productId: ri.selectedProductId!,
                quantityKg: ri.quantity,
                pricePerKg: p?.defaultPricePerKg || 4.5,
                unit: ri.unit
            };
        });

        onItemsConfirmed(itemsToCheckout);
        setReviewItems(null);
        setText('');
    };

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col animate-in slide-in-from-top-4 duration-500 max-h-[85vh] md:max-h-[600px] overflow-hidden mb-8">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">AI Quick Order</h2>
                        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">Natural Language Procurement {isBlocked && ' - BLOCKED'}</p>
                    </div>
                </div>
                {reviewItems && (
                    <button onClick={() => setReviewItems(null)} className="text-gray-400 hover:text-red-500 transition-colors p-2"><X size={20}/></button>
                )}
            </div>

            {reviewItems ? (
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="px-8 pt-4 pb-2 shrink-0">
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18}/>
                            <div>
                                <p className="text-xs font-black text-amber-900 uppercase tracking-tight">Review Order List</p>
                                <p className="text-[11px] text-amber-700 font-medium mt-0.5">Clarify varieties before adding to your active cart.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-4 space-y-4">
                        {reviewItems.map((item, idx) => {
                            const matchedProduct = catalog.find(p => p.id === item.selectedProductId);
                            return (
                                <div key={idx} className={`p-6 rounded-3xl border transition-all ${item.isAmbiguous && !item.selectedProductId ? 'border-amber-300 bg-amber-50/20 ring-2 ring-amber-100' : 'border-gray-50 bg-[#F8FAFC]'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-black text-gray-900 uppercase text-base tracking-tight">{item.productName}</h4>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{item.quantity} {item.unit}</p>
                                        </div>
                                        {item.isAmbiguous && !item.selectedProductId && (
                                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Select Variant</span>
                                        )}
                                        {item.selectedProductId && (
                                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><Check size={12}/> Ready</span>
                                        )}
                                    </div>

                                    {item.suggestedProductIds && item.suggestedProductIds.length > 0 && !item.selectedProductId && (
                                        <div className="grid grid-cols-1 gap-2 mt-4 animate-in slide-in-from-top-2">
                                            {item.suggestedProductIds.map(sid => {
                                                const p = catalog.find(prod => prod.id === sid);
                                                if (!p) return null;
                                                return (
                                                    <button 
                                                        key={sid}
                                                        onClick={() => handleUpdateItem(idx, { selectedProductId: p.id })}
                                                        className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group shadow-sm active:scale-95"
                                                    >
                                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                                            <img src={p.imageUrl} className="w-full h-full object-cover" alt=""/>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-black text-gray-900 truncate uppercase">{p.name}</p>
                                                            <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest">{p.variety}</p>
                                                        </div>
                                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-500" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {item.selectedProductId && matchedProduct && (
                                        <div className="flex items-center gap-4 p-3 bg-white border border-emerald-100 rounded-2xl shadow-sm">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-50">
                                                <img src={matchedProduct.imageUrl} className="w-full h-full object-cover" alt=""/>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-black text-emerald-900 uppercase truncate">{matchedProduct.name} ({matchedProduct.variety})</p>
                                            </div>
                                            <button onClick={() => handleUpdateItem(idx, { selectedProductId: undefined })} className="p-2 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 rounded-lg"><X size={16}/></button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4 shrink-0">
                        <button 
                            onClick={() => setReviewItems(null)}
                            className="flex-1 py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-[1.25rem] font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-all active:scale-95"
                        >
                            Discard
                        </button>
                        <button 
                            onClick={handleFinalConfirm}
                            disabled={isBlocked}
                            className="flex-[2] py-5 bg-[#0F172A] text-white rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                        >
                            <ShoppingCart size={18}/> Verify & Add to Cart
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-8 flex-1 flex flex-col animate-in fade-in duration-500">
                    <div className="relative group flex-1">
                        <textarea 
                            disabled={isBlocked}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={isBlocked ? "Orders disabled - pay outstanding invoice" : "e.g. 100kg bananas, 5kg tomatoes, 90 trays of avocado..."}
                            className={`w-full h-full min-h-[200px] p-6 bg-gray-50 border border-gray-100 rounded-[1.5rem] font-bold text-gray-900 resize-none outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all placeholder-gray-300 text-base ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-white/80 px-2 py-1 rounded-lg backdrop-blur-sm">Supports: KG, Tray, Each, Loose, Bag</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleParse}
                        disabled={isParsing || !text.trim() || isBlocked}
                        className="mt-8 w-full py-6 bg-[#0F172A] text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] shrink-0"
                    >
                        {isParsing ? (
                            <><Loader2 size={20} className="animate-spin" /> Matching Catalog...</>
                        ) : (
                            <><ShoppingCart size={18}/> Generate Order List</>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

const OrderTuningPanel = ({ order, products, onConfirm, onCancel, isBlocked }: { 
    order: Order, 
    products: Product[], 
    onConfirm: (items: OrderItem[]) => void, 
    onCancel: () => void,
    isBlocked: boolean
}) => {
    const [editedItems, setEditedItems] = useState<OrderItem[]>([]);

    useEffect(() => {
        setEditedItems(order.items.map(i => ({ ...i })));
    }, [order]);

    const adjustQty = (productId: string, delta: number) => {
        setEditedItems(prev => prev.map(item => 
            item.productId === productId 
                ? { ...item, quantityKg: Math.max(0, item.quantityKg + delta) }
                : item
        ).filter(item => item.quantityKg >= 0));
    };

    const removeItem = (productId: string) => {
        setEditedItems(prev => prev.filter(item => item.productId !== productId));
    };

    const totalAmount = editedItems.reduce((sum, item) => sum + (item.quantityKg * item.pricePerKg), 0);

    return (
        <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-indigo-50/30">
                <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase">Tuning Order #{order.id.split('-').pop()}</h4>
                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">Adjust quantities before re-ordering</p>
                </div>
                <button onClick={onCancel} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                {editedItems.map(item => {
                    const p = products.find(prod => prod.id === item.productId);
                    return (
                        <div key={item.productId} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-indigo-100 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                                    <img src={p?.imageUrl} className="w-full h-full object-cover" alt=""/>
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-sm uppercase tracking-tight">{p?.name}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">${item.pricePerKg.toFixed(2)} / {p?.unit || 'kg'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                                    <button onClick={() => adjustQty(item.productId, -1)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Minus size={14}/></button>
                                    <span className="w-12 text-center font-black text-gray-900 text-sm">{item.quantityKg}</span>
                                    <button onClick={() => adjustQty(item.productId, 1)} className="p-2 text-gray-400 hover:text-emerald-600 transition-all"><Plus size={14}/></button>
                                </div>
                                <button onClick={() => removeItem(item.productId)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><X size={16}/></button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-8 border-t border-gray-100 bg-gray-50 shrink-0">
                <div className="flex justify-between items-center mb-6 px-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Re-order Total</span>
                    <span className="text-2xl font-black text-emerald-700 tracking-tighter">${totalAmount.toFixed(2)}</span>
                </div>
                <button 
                    onClick={() => onConfirm(editedItems)}
                    disabled={editedItems.length === 0 || isBlocked}
                    className="w-full py-5 bg-[#043003] hover:bg-black text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group disabled:opacity-50"
                >
                    <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500"/> Add to Active Cart
                </button>
            </div>
        </div>
    );
};

const WeeklyOrderCalendar = ({ orders, products, onReorder, isBlocked }: { orders: Order[], products: Product[], onReorder: (items: OrderItem[]) => void, isBlocked: boolean }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    const weekDays = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today.getTime() - 86400000 * i);
            days.push(d);
        }
        return days;
    }, []);

    const ordersForSelectedDay = orders.filter(o => new Date(o.date).toDateString() === selectedDate.toDateString());

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px] animate-in slide-in-from-right-4">
            <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Calendar size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">Weekly Order Calendar</h2>
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1">Live History & Re-ordering</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 p-6 border-b border-gray-50 overflow-x-auto no-scrollbar shrink-0 bg-white">
                {weekDays.map((date, idx) => {
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const dayOrders = orders.filter(o => new Date(o.date).toDateString() === date.toDateString());
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    return (
                        <button 
                            key={idx}
                            onClick={() => { setSelectedDate(date); setViewingOrder(null); }}
                            className={`min-w-[80px] flex-1 py-4 rounded-2xl flex flex-col items-center gap-1.5 transition-all border-2 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105 z-10' : 'bg-white border-gray-50 text-gray-400 hover:border-indigo-100'}`}
                        >
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{date.toLocaleDateString('default', { weekday: 'short' })}</span>
                            <span className="text-lg font-black tracking-tighter">{date.getDate()}</span>
                            {dayOrders.length > 0 && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500 animate-pulse'}`}></div>}
                            {isToday && !isSelected && <span className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter">Today</span>}
                        </button>
                    );
                })}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {viewingOrder ? (
                    <OrderTuningPanel 
                        order={viewingOrder} 
                        products={products} 
                        isBlocked={isBlocked}
                        onCancel={() => setViewingOrder(null)} 
                        onConfirm={(items) => { onReorder(items); setViewingOrder(null); }} 
                    />
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-4 bg-gray-50/20">
                        <div className="mb-6 px-2 flex justify-between items-end">
                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Selected Day</h3>
                                <p className="text-lg font-black text-gray-900 tracking-tight uppercase leading-none mt-1">
                                    {selectedDate.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                            {ordersForSelectedDay.length > 0 && (
                                <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                    {ordersForSelectedDay.length} Orders
                                </span>
                            )}
                        </div>

                        {ordersForSelectedDay.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
                                <Package size={48} className="text-gray-200 mb-4" />
                                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No orders logged for this day</p>
                            </div>
                        ) : (
                            ordersForSelectedDay.map(order => (
                                <div key={order.id} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                                <ShoppingBag size={20}/>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-gray-900 text-base tracking-tight uppercase">Order #{order.id.split('-').pop()}</h3>
                                                <div className="flex items-center gap-4 mt-0.5">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.items.length} Lines</span>
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">${order.totalAmount.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                        }`}>
                                            {order.status}
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setViewingOrder(order)}
                                            className="flex-1 py-3 bg-[#0F172A] hover:bg-black text-white rounded-xl font-black text-[9px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2"
                                        >
                                            <Edit3 size={14}/> Edit & Re-order
                                        </button>
                                        <button 
                                            onClick={() => onReorder(order.items)}
                                            disabled={isBlocked}
                                            className="px-4 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl font-black text-[9px] uppercase tracking-[0.15em] hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <RefreshCcw size={14}/> One-tap Re-order
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const ActiveRunStatus = ({ order, products }: { order: Order, products: Product[] }) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (order.status !== 'Delivered' || !order.deliveredAt) return;
        
        const updateTimer = () => {
            const delivered = new Date(order.deliveredAt!).getTime();
            const now = new Date().getTime();
            const diff = (90 * 60 * 1000) - (now - delivered);
            
            if (diff <= 0) {
                setTimeLeft('00:00');
                return;
            }
            
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [order.status, order.deliveredAt]);

    const steps = [
        { label: 'PENDING', icon: Clock, time: order.confirmedAt, active: true },
        { label: 'PROCESSING', icon: Package, time: order.preparedAt, active: !!order.preparedAt },
        { label: 'TRANSIT', icon: Truck, time: order.shippedAt, active: !!order.shippedAt },
        { label: 'DELIVERED', icon: CheckCircle, time: order.deliveredAt, active: order.status === 'Delivered' }
    ];

    const currentStepIndex = steps.filter(s => s.active).length - 1;

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-left-4 h-fit">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/20">
                <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">Active Incoming Delivery</h2>
                <button onClick={() => navigate('/orders')} className="text-emerald-600 font-black text-[9px] uppercase tracking-widest hover:underline">TRACKING HISTORY</button>
            </div>

            <div className="p-8 space-y-10">
                <div className="bg-indigo-50/40 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center border border-indigo-100 relative group">
                    <div className="text-center sm:text-left">
                        <p className="font-black text-gray-900 text-2xl tracking-tighter mb-1 uppercase">Order #{order.id.split('-').pop()}</p>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                            {order.status === 'Delivered' ? `Delivered at ${new Date(order.deliveredAt!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : `ETA: ${order.logistics?.deliveryTime || 'Scheduling'}`}
                        </p>
                    </div>
                    <span className="mt-4 sm:mt-0 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-indigo-600 text-white shadow-lg transition-transform group-hover:scale-105">{order.status}</span>
                </div>

                <div className="flex justify-between items-start w-full px-4 relative">
                    <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-100 z-0"></div>
                    <div 
                        className="absolute top-5 left-10 h-0.5 bg-emerald-500 z-0 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 82}%` }}
                    ></div>

                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isPast = idx < currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        
                        return (
                            <div key={idx} className="flex flex-col items-center flex-1 relative z-10">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 border-2 ${
                                    isPast || isCurrent ? 'bg-emerald-500 text-white border-white shadow-md' : 'bg-white text-gray-200 border-gray-50'
                                }`}>
                                    <Icon size={18} />
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-[0.15em] mt-3 ${isPast || isCurrent ? 'text-gray-900' : 'text-gray-300'}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div>
                    {order.status === 'Delivered' ? (
                        <div className="space-y-4">
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-xl shadow-sm border border-emerald-50 text-emerald-600">
                                        <CheckCircle size={20}/>
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-xs uppercase tracking-tight leading-none">Drop-off Confirmed</p>
                                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">
                                            {order.logistics?.driverName} logged delivery
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate('/orders')}
                                className="w-full py-5 bg-[#043003] hover:bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all text-xs"
                            >
                                <Clock size={16} className="animate-pulse text-emerald-400"/>
                                VERIFY ITEMS ({timeLeft})
                            </button>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
                             <div className="flex items-center gap-3 text-gray-500 text-[9px] font-black uppercase tracking-widest">
                                <MapPin size={16} className="text-indigo-400"/>
                                {order.logistics?.deliveryLocation || 'Location TBD'}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Driver</p>
                                    <p className="text-[10px] font-black text-gray-900 uppercase">{order.logistics?.driverName || 'Allocating...'}</p>
                                </div>
                                <button className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-indigo-600">
                                    <ArrowRight size={14}/>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<OrderItem[] | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Mobile Tab State
  const [activeMobileFeature, setActiveMobileFeature] = useState<'WEEKLY' | 'AI_QUICK' | 'DELIVERIES'>('WEEKLY');

  useEffect(() => {
    const fetchOrders = () => {
        const userOrders = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
        setAllOrders(userOrders);
        setProducts(mockService.getAllProducts());
        setIsBlocked(mockService.hasOutstandingInvoices(user.id));
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [user.id]);

  const activeRuns = allOrders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped', 'Delivered'].includes(o.status));
  const activeOrderForTracking = activeRuns.find(o => o.status === 'Delivered' && !o.isFullyVerified) || activeRuns[0];

  const handleConfirmedItems = (confirmedItems: OrderItem[]) => {
      if (isBlocked) return;
      setCheckoutItems(confirmedItems);
  };

  const handlePlaceOrder = (details: any) => {
      if (isBlocked) return;
      const newOrder = mockService.createFullOrder(user.id, details.items, details.total);
      newOrder.logistics = {
          deliveryLocation: user.businessName,
          deliveryTime: details.deliveryTime,
          deliveryDate: details.deliveryDate,
          instructions: `Contact: ${details.contactName}`
      };
      newOrder.paymentMethod = details.paymentMethod;
      
      setCheckoutItems(null);
      alert(`Success! Order placed successfully.`);
      navigate('/orders');
  };

  const mobileFeatureTabs = [
      { id: 'WEEKLY', label: 'Weekly View', icon: Calendar },
      { id: 'AI_QUICK', label: 'AI Quick Order', icon: Sparkles },
      { id: 'CATALOG', label: 'Catalog', icon: ShoppingBag, action: () => navigate('/marketplace') },
      { id: 'DELIVERIES', label: 'Deliveries', icon: Truck }
  ];

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 bg-[#F8FAFC] pb-24">
      
      {isBlocked && (
          <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-8 flex items-center gap-6 shadow-sm mb-8 animate-in slide-in-from-top-4">
              <div className="bg-red-500 p-4 rounded-2xl text-white shadow-lg shadow-red-200 animate-pulse">
                  <AlertCircle size={32}/>
              </div>
              <div className="flex-1">
                  <h3 className="font-black text-red-900 uppercase tracking-tight text-xl leading-none">Trading Restricted</h3>
                  <p className="text-red-700 font-medium leading-relaxed mt-2">
                    Your ability to place new orders via Quick Order or re-orders is disabled due to <span className="font-black">outstanding invoices</span>.
                  </p>
                  <button onClick={() => navigate('/accounts')} className="mt-4 px-6 py-2 bg-white border border-red-200 text-red-600 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-red-50 transition-all">Settle Account Now</button>
              </div>
          </div>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-[1.25rem] shadow-sm border border-gray-100 shrink-0">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">Monthly Spend</p>
                <DollarSign size={18} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter leading-none">$12,450</h3>
            <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-tight mt-2 flex items-center gap-1">
                <Leaf size={12}/> 14% Optimized
            </p>
        </div>
        <div className="bg-white p-6 rounded-[1.25rem] shadow-sm border border-gray-100 shrink-0">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">Active Shipments</p>
                <Truck size={18} className="text-indigo-500" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter leading-none">{activeRuns.length}</h3>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tight mt-2">1 Arriving Today</p>
        </div>
        <div className="bg-white p-6 rounded-[1.25rem] shadow-sm border border-gray-100 shrink-0">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">Invoices Due</p>
                <Clock size={18} className="text-orange-500" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter leading-none">{allOrders.filter(o => o.paymentStatus !== 'Paid').length}</h3>
            <p className="text-orange-600 text-[10px] font-bold uppercase tracking-tight mt-2">${allOrders.filter(o => o.paymentStatus !== 'Paid').reduce((sum, o) => sum + o.totalAmount, 0).toFixed(0)} Outstanding</p>
        </div>
        <div className="bg-white p-6 rounded-[1.25rem] shadow-sm border border-gray-100 shrink-0">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">CO2 Diverted</p>
                <Leaf size={18} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter leading-none">428<span className="text-lg ml-1">kg</span></h3>
            <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-tight mt-2 flex items-center gap-1">
                <CheckCircle size={12}/> Verified Impact
            </p>
        </div>
      </div>

      {/* MOBILE NAVIGATION BAR */}
      <div className="md:hidden sticky top-20 z-20 -mx-8 px-8 py-4 bg-[#F8FAFC]/80 backdrop-blur-md border-y border-gray-100">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {mobileFeatureTabs.map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => {
                        if (tab.action) tab.action();
                        else setActiveMobileFeature(tab.id as any);
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                        activeMobileFeature === tab.id 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                      <tab.icon size={14} strokeWidth={3} />
                      {tab.label}
                  </button>
              ))}
          </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
            <AiQuickOrder onItemsConfirmed={handleConfirmedItems} catalog={products} isBlocked={isBlocked} />
            
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-700">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
                    <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">Recent Order History</h2>
                    <button onClick={() => navigate('/orders')} className="text-emerald-600 font-black text-[9px] uppercase tracking-widest hover:underline">VIEW ALL ORDERS</button>
                </div>
                <div className="divide-y divide-gray-50">
                    {allOrders.length === 0 ? (
                        <div className="p-20 text-center text-gray-400">No previous orders found.</div>
                    ) : (
                        allOrders.slice(0, 5).map(order => (
                            <div key={order.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner-sm">
                                        <ShoppingCart size={20}/>
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-lg tracking-tight uppercase leading-none">Order #{order.id.split('-').pop()}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(order.date).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">${order.totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-400 text-[8px] font-black uppercase tracking-widest">{order.status}</span>
                                    <ChevronRight size={20} className="text-gray-300 group-hover:text-indigo-600 transition-all"/>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-8">
            {activeOrderForTracking && (
                <ActiveRunStatus order={activeOrderForTracking} products={products} />
            )}
            <WeeklyOrderCalendar orders={allOrders} products={products} onReorder={handleConfirmedItems} isBlocked={isBlocked} />
        </div>
      </div>

      {/* Mobile Dynamic Layout */}
      <div className="md:hidden space-y-8">
          {activeMobileFeature === 'WEEKLY' && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                  <WeeklyOrderCalendar orders={allOrders} products={products} onReorder={handleConfirmedItems} isBlocked={isBlocked} />
              </div>
          )}
          {activeMobileFeature === 'AI_QUICK' && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                  <AiQuickOrder onItemsConfirmed={handleConfirmedItems} catalog={products} isBlocked={isBlocked} />
              </div>
          )}
          {activeMobileFeature === 'DELIVERIES' && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                  {activeOrderForTracking ? (
                      <ActiveRunStatus order={activeOrderForTracking} products={products} />
                  ) : (
                      <div className="p-12 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                          <Truck size={48} className="mx-auto text-gray-100 mb-4" />
                          <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No active deliveries tracked</p>
                      </div>
                  )}
              </div>
          )}
      </div>

      <CheckoutModal 
        isOpen={!!checkoutItems} 
        onClose={() => setCheckoutItems(null)} 
        items={checkoutItems || []} 
        products={products}
        onPlaceOrder={handlePlaceOrder}
        isBlocked={isBlocked}
      />
    </div>
  );
};
