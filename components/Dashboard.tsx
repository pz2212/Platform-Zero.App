
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Order, Product, Customer, UserRole, InventoryItem, Driver, Packer, AppNotification, SupplierPriceRequest } from '../types';
import { mockService } from '../services/mockDataService';
import { AiOpportunityMatcher } from './AiOpportunityMatcher';
import { Settings as SettingsComponent } from './Settings';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';
import { WholesalerPriceRequestModal } from './WholesalerPriceRequestModal';
import { 
  Package, Truck, MapPin, LayoutDashboard, 
  Users, Clock, CheckCircle, X, Mail, Smartphone, Building,
  Settings, Calculator, FileText, ChevronRight, LayoutGrid, Search, Bell, History, Calendar, Printer, AlertTriangle, TrendingUp, Globe, Star, UserPlus, ArrowUpRight,
  Plus, Store, MessageSquare, Camera, Image as ImageIcon, Loader2, Send, ChevronDown, DollarSign,
  Boxes, ClipboardCheck, UserCheck, Timer, ArrowRight, ShoppingBag, Check, Zap, HandCoins, Target, MessageCircle, Sparkles, Activity, Leaf, Sun,
  UserCheck2,
  PackageCheck,
  ShoppingCart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

// Sub-component for the detail views triggered by the KPI cards
const LiveDetailOverlay = ({ isOpen, onClose, title, subtitle, icon: Icon, children }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 border-4 border-white/20">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-[#043003] rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Icon size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">{title}</h2>
                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-2">{subtitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white hover:bg-gray-100 rounded-full border border-gray-100 shadow-sm transition-all text-gray-300 hover:text-gray-900">
                        <X size={28} strokeWidth={2.5}/>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                    {children}
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
                    <button onClick={onClose} className="px-12 py-3 bg-[#0F172A] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg">Close View</button>
                </div>
            </div>
        </div>
    );
};

const OrderFulfillmentModal = ({ isOpen, onClose, order, products, customers, onUpdate }: any) => {
    const [selectedPacker, setSelectedPacker] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen || !order) return null;

    const buyer = customers.find((c: any) => c.id === order.buyerId);
    
    const handleAccept = async () => {
        setIsProcessing(true);
        mockService.acceptOrderV2(order.id);
        await new Promise(r => setTimeout(r, 600));
        setIsProcessing(false);
        onUpdate();
    };

    const handlePack = async () => {
        if (!selectedPacker) return alert("Assign a packer first.");
        setIsProcessing(true);
        mockService.packOrder(order.id, selectedPacker);
        await new Promise(r => setTimeout(r, 600));
        setIsProcessing(false);
        onUpdate();
    };

    const handleDispatch = async () => {
        if (!selectedDriver) return alert("Assign a driver first.");
        setIsProcessing(true);
        const targetOrder = mockService.getOrders('u1').find(o => o.id === order.id);
        if (targetOrder) {
            targetOrder.status = 'Shipped';
            targetOrder.shippedAt = new Date().toISOString();
            targetOrder.logistics = { ...targetOrder.logistics, driverName: selectedDriver };
        }
        await new Promise(r => setTimeout(r, 600));
        setIsProcessing(false);
        onUpdate();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#043003] rounded-2xl flex items-center justify-center text-white font-black shadow-lg">P</div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Order Fulfillment</h2>
                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1.5">REF: #{order.id.split('-').pop()} • {buyer?.businessName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-900 p-2 bg-white rounded-full border border-gray-100 shadow-sm transition-all"><X size={24} strokeWidth={2.5}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                <FileText size={14}/> PRODUCT PACKING LIST
                            </h3>
                            <div className="divide-y divide-gray-50 border border-gray-100 rounded-3xl overflow-hidden bg-gray-50/30">
                                {order.items.map((item: any, idx: number) => {
                                    const p = products.find((prod: any) => prod.id === item.productId);
                                    return (
                                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-white transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                                    <img src={p?.imageUrl} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-sm uppercase truncate max-w-[120px]">{p?.name}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p?.variety}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900 text-lg tracking-tighter">{item.quantityKg}{p?.unit || 'kg'}</p>
                                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">${item.pricePerKg.toFixed(2)}/u</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100 flex items-start gap-4">
                            <MapPin className="text-indigo-500 mt-1 shrink-0" size={20}/>
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Delivery Coordinates</p>
                                <p className="text-sm font-black text-gray-900 mt-1">{buyer?.onboardingData?.deliveryAddress || 'Market Location: ' + buyer?.location}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {order.status === 'Pending' ? (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4">
                                <div className="bg-orange-50 border border-orange-100 p-8 rounded-[2rem] text-center space-y-4">
                                    <Clock size={40} className="mx-auto text-orange-400 animate-pulse" />
                                    <h4 className="text-xl font-black text-orange-900 uppercase tracking-tight">Market Acceptance Required</h4>
                                    <p className="text-sm text-orange-700 font-medium">Verify stock availability before committing to the buyer.</p>
                                    <button onClick={handleAccept} disabled={isProcessing} className="w-full py-5 bg-[#043003] hover:bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all">
                                        {isProcessing ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20}/> Confirm Availability</>}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center px-2">
                                    {['ACCEPTED', 'PACKED', 'SHIPPED'].map((s, idx) => {
                                        const isActive = (s === 'ACCEPTED' && order.status === 'Confirmed') || (s === 'PACKED' && order.status === 'Ready for Delivery') || (s === 'SHIPPED' && order.status === 'Shipped');
                                        const isPast = (s === 'ACCEPTED' && ['Ready for Delivery', 'Shipped', 'Delivered'].includes(order.status)) || (s === 'PACKED' && ['Shipped', 'Delivered'].includes(order.status));
                                        return (
                                            <div key={s} className="flex flex-col items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isPast ? 'bg-emerald-500 border-emerald-500 text-white' : isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 text-gray-300'}`}>
                                                    {isPast ? <Check size={14} strokeWidth={4}/> : <span className="text-[10px] font-black">{idx + 1}</span>}
                                                </div>
                                                <span className={`text-[8px] font-black uppercase tracking-widest ${isActive || isPast ? 'text-gray-900' : 'text-gray-300'}`}>{s}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className={`p-8 rounded-[2rem] border transition-all ${order.status === 'Confirmed' ? 'bg-white border-indigo-200 shadow-lg' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.status === 'Confirmed' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                            <Boxes size={24}/>
                                        </div>
                                        <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest">Assign Packing</h4>
                                    </div>
                                    <select disabled={order.status !== 'Confirmed'} className="w-full p-4 bg-white border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest mb-4" value={selectedPacker} onChange={(e) => setSelectedPacker(e.target.value)}>
                                        <option value="">Choose Personnel...</option>
                                        <option value="Alex Packer">Alex Packer</option>
                                        <option value="Sam Sort">Sam Sort</option>
                                    </select>
                                    {order.status === 'Confirmed' && (
                                        <button onClick={handlePack} disabled={!selectedPacker} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">Mark as Packed</button>
                                    )}
                                </div>
                                <div className={`p-8 rounded-[2rem] border transition-all ${order.status === 'Ready for Delivery' ? 'bg-white border-emerald-200 shadow-lg' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.status === 'Ready for Delivery' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                            <Truck size={24}/>
                                        </div>
                                        <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest">Dispatch Fleet</h4>
                                    </div>
                                    <select disabled={order.status !== 'Ready for Delivery'} className="w-full p-4 bg-white border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest mb-4" value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
                                        <option value="">Assign Driver...</option>
                                        <option value="Dave Transit">Dave Transit</option>
                                        <option value="Route Hub">External: PZ Hub</option>
                                    </select>
                                    {order.status === 'Ready for Delivery' && (
                                        <button onClick={handleDispatch} disabled={!selectedDriver} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">Confirm Dispatch</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-8 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Platform Zero Operations Protocol v2.5</p>
                    <button onClick={onClose} className="px-10 py-3 bg-white border-2 border-gray-200 text-gray-400 rounded-xl font-black uppercase text-[10px] tracking-widest">Back</button>
                </div>
            </div>
        </div>
    );
};

const LiveActivitySnapshot = ({ stats, onCardClick }: any) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* ORDERS TODAY */}
            <button 
                onClick={() => onCardClick('ORDERS')}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden h-44 text-left active:scale-[0.98]"
            >
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Orders Today</p>
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tight">Incoming live volume</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
                    </div>
                </div>
                <div className="flex justify-between items-end relative z-10">
                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{stats.ordersToday || 0}</h3>
                    <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                        <Activity size={24} />
                    </div>
                </div>
            </button>

            {/* LIVE WHOLESALERS (MATCHED BUYERS) */}
            <button 
                onClick={() => onCardClick('BUYERS')}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden h-44 text-left active:scale-[0.98]"
            >
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Live Wholesalers</p>
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tight">Looking to buy your stock</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
                    </div>
                </div>
                <div className="flex justify-between items-end relative z-10">
                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{stats.wholesalers || 0}</h3>
                    <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl group-hover:scale-110 transition-transform">
                        <Globe size={24} />
                    </div>
                </div>
            </button>

            {/* ACTIVE DELIVERIES (ON THE ROAD) */}
            <button 
                onClick={() => onCardClick('DELIVERIES')}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden h-44 text-left active:scale-[0.98]"
            >
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">On the Road</p>
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tight">Deliveries out for dispatch</p>
                    </div>
                </div>
                <div className="flex justify-between items-end relative z-10">
                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{stats.deliveriesOnRoad || 0}</h3>
                    <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                        <Truck size={24} />
                    </div>
                </div>
            </button>

            {/* MY REVENUE TODAY */}
            <button 
                onClick={() => onCardClick('REVENUE')}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden h-44 text-left active:scale-[0.98]"
            >
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">My Revenue Today</p>
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tight">Personal daily volume</p>
                    </div>
                </div>
                <div className="flex justify-between items-end relative z-10">
                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter">${stats.myRevenueToday?.toLocaleString() || '0'}</h3>
                    <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                        <DollarSign size={24} />
                    </div>
                </div>
            </button>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SCANNER' | 'SETTINGS'>('ORDERS');
  const [orderSubTab, setOrderSubTab] = useState<'INCOMING' | 'PROCESSING' | 'ACTIVE' | 'HISTORY'>('INCOMING');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pendingPriceRequests, setPendingPriceRequests] = useState<SupplierPriceRequest[]>([]);
  const [selectedPriceRequest, setSelectedPriceRequest] = useState<SupplierPriceRequest | null>(null);
  const [marketStats, setMarketStats] = useState<any>({});
  
  // State for which detailed "Live View" is open
  const [liveDetailView, setLiveDetailView] = useState<'ORDERS' | 'BUYERS' | 'DELIVERIES' | 'REVENUE' | null>(null);

  const products = mockService.getAllProducts();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = () => {
    const allSellingOrders = mockService.getOrders(user.id).filter(o => o.sellerId === user.id);
    setOrders(allSellingOrders);
    setCustomers(mockService.getCustomers());
    
    // Load pending price requests for the wholesaler
    const requests = mockService.getSupplierPriceRequests(user.id).filter(r => r.status === 'PENDING');
    setPendingPriceRequests(requests);

    // Calculate specific stats for Sarah (user)
    const today = new Date().toDateString();
    const myTodaysOrders = allSellingOrders.filter(o => new Date(o.date).toDateString() === today);
    const myRevenueToday = myTodaysOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const deliveriesOnRoad = allSellingOrders.filter(o => o.status === 'Shipped').length;
    
    // Live Wholesalers who want what I sell
    const sellingInterests = user.activeSellingInterests || [];
    const allBuyers = mockService.getAllUsers().filter(u => u.id !== user.id && (u.role === UserRole.WHOLESALER || u.role === UserRole.GROCERY || u.role === UserRole.CONSUMER));
    const matchedBuyers = allBuyers.filter(b => 
        b.activeBuyingInterests?.some(interest => 
            sellingInterests.some(myStock => myStock.toLowerCase() === interest.toLowerCase())
        )
    ).length;

    setMarketStats({
        ordersToday: myTodaysOrders.length,
        wholesalers: matchedBuyers, // Looking for my products
        myRevenueToday,
        deliveriesOnRoad,
        todaysOrders: myTodaysOrders,
        onRoadOrders: allSellingOrders.filter(o => o.status === 'Shipped'),
        buyerMatches: allBuyers.filter(b => 
            b.activeBuyingInterests?.some(interest => 
                sellingInterests.some(myStock => myStock.toLowerCase() === interest.toLowerCase())
            )
        )
    });
  };

  const incomingQueue = orders.filter(o => o.status === 'Pending');
  const processingQueue = orders.filter(o => ['Confirmed', 'Ready for Delivery'].includes(o.status));
  const activeFulfillment = orders.filter(o => o.status === 'Shipped');
  const pastOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));

  const currentSellingList = orderSubTab === 'INCOMING' ? incomingQueue : 
                           orderSubTab === 'PROCESSING' ? processingQueue :
                           orderSubTab === 'ACTIVE' ? activeFulfillment : pastOrders;

  return (
    <div className="animate-in fade-in duration-500 min-h-screen pb-20">
      
      {/* HEADER SECTION */}
      <div className="mb-6 border-b border-gray-100 pb-6 px-2 space-y-8">
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-[44px] font-black text-[#0F172A] tracking-tighter uppercase leading-none">Partner Operations</h1>
                <p className="text-gray-400 font-bold text-sm tracking-tight mt-2 flex items-center gap-3 uppercase">
                    Management Console <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span> {user.businessName}
                </p>
            </div>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 border border-gray-200 shadow-inner-sm w-full md:w-max overflow-x-auto no-scrollbar">
            {[
                { id: 'ORDERS', label: 'Orders', icon: LayoutGrid },
                { id: 'SCANNER', label: 'Scanner', icon: Camera },
                { id: 'SETTINGS', label: 'Config', icon: Settings }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 md:flex-none px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <tab.icon size={14}/> {tab.label}
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'ORDERS' && (
        <div className="px-2">
            
            {/* LIVE ACTIVITY SNAPSHOT SECTION */}
            <LiveActivitySnapshot stats={marketStats} onCardClick={setLiveDetailView} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* LEFT SIDE: ORDER FULFILLMENT PIPELINE (8 Columns) */}
                <div className="xl:col-span-8 space-y-8 animate-in slide-in-from-left-4 duration-700">
                    
                    {/* URGENT PRICE AUDIT REQUESTS (Requested Enhancement) */}
                    {pendingPriceRequests.length > 0 && (
                        <div className="bg-[#FFF1F2] border-4 border-red-500 rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden animate-in slide-in-from-top-10 duration-700">
                            <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150"><Calculator size={200} /></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-red-500 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-red-500/30 border-4 border-white animate-pulse">
                                        <Calculator size={40} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h2 className="text-2xl font-black text-red-900 uppercase tracking-tighter leading-none">Urgent Action Required</h2>
                                            <span className="bg-red-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">Live Lead</span>
                                        </div>
                                        <p className="text-red-700 text-sm font-bold leading-relaxed max-w-lg">
                                            Platform Zero HQ has assigned <span className="font-black underline">{pendingPriceRequests.length} pending price audits</span> to your entity. Submit your best wholesale rates now to win these new buyers.
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedPriceRequest(pendingPriceRequests[0])}
                                    className="w-full md:w-auto px-14 py-6 bg-red-600 hover:bg-black text-white rounded-3xl font-black uppercase tracking-[0.25em] text-xs shadow-2xl shadow-red-900/40 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                                >
                                    Open Price Audit <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
                        <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-8 shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-md border border-gray-100 shrink-0">
                                    <LayoutGrid size={28}/>
                                </div>
                                {activeTab === 'ORDERS' && (
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Fulfillment Pipeline</h2>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Managing your direct sales trade flow</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 border border-gray-200 shadow-inner-sm w-full md:w-auto">
                                {[
                                    { id: 'INCOMING', label: 'Incoming', count: incomingQueue.length, icon: Bell, color: 'text-orange-500' },
                                    { id: 'PROCESSING', label: 'Processing', count: processingQueue.length, icon: Package, color: 'text-indigo-500' },
                                    { id: 'ACTIVE', label: 'Active Runs', count: activeFulfillment.length, icon: Truck, color: 'text-emerald-500' },
                                    { id: 'HISTORY', label: 'History', count: null, icon: History, color: 'text-gray-400' }
                                ].map((sub) => (
                                    <button 
                                        key={sub.id}
                                        onClick={() => setOrderSubTab(sub.id as any)}
                                        className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${orderSubTab === sub.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <sub.icon size={14} className={orderSubTab === sub.id ? sub.color : 'text-gray-400'}/> {sub.label} 
                                        {sub.count !== null && sub.count > 0 && <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white ${sub.color.replace('text-', 'bg-')}`}>{sub.count}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
                            {currentSellingList.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-32 grayscale">
                                    <ShoppingCart size={64} className="mb-6 text-gray-200" />
                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">No active orders in this phase</p>
                                </div>
                            ) : (
                                currentSellingList.map(order => {
                                    const buyer = customers.find(c => c.id === order.buyerId);
                                    const isMarketplace = order.source === 'Marketplace';
                                    
                                    return (
                                        <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group animate-in slide-in-from-bottom-2">
                                            <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                                                <div className="flex items-center gap-6 flex-1 w-full">
                                                    <div className="w-16 h-16 rounded-[1.75rem] bg-gray-50 flex items-center justify-center text-gray-400 font-black text-2xl shadow-inner-sm uppercase border border-gray-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                                                        {buyer?.businessName.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none truncate">{buyer?.businessName}</h4>
                                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                                isMarketplace 
                                                                ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                                                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                            }`}>
                                                                {isMarketplace ? 'PZ Marketplace' : 'Customer Direct'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-4">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> {new Date(order.date).toLocaleDateString()}</span>
                                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                                                order.status === 'Shipped' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-10 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-0 border-gray-50 pt-6 lg:pt-0">
                                                    <div className="text-left lg:text-right">
                                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Total</p>
                                                        <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">${order.totalAmount.toFixed(2)}</p>
                                                    </div>
                                                    
                                                    <button onClick={() => setSelectedOrder(order)} className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${order.status === 'Pending' ? 'bg-[#043003] text-white hover:bg-black' : 'bg-white border-2 border-indigo-100 text-indigo-600'}`}>
                                                        {order.status === 'Pending' ? 'Accept Order' : 'Manage Ops'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: NETWORK PERFORMANCE & ACTIVITY */}
                <div className="xl:col-span-4 space-y-8 animate-in slide-in-from-right-4 duration-700">
                    <div className="bg-[#0B1221] rounded-[3.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col h-full min-h-[700px] relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150 pointer-events-none"><Zap size={200} className="text-indigo-400"/></div>
                        
                        <div className="p-10 border-b border-white/5 relative z-10">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                    <TrendingUp size={24}/>
                                </div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Market Activity</h2>
                            </div>
                            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.25em]">Live Network Performance</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-10 relative z-10 custom-scrollbar">
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Network Statistics</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Trading Volume</p>
                                        <p className="text-3xl font-black text-white tracking-tighter">${orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Fulfillment Efficiency</p>
                                        <p className="text-3xl font-black text-white tracking-tighter">98.2%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Recent Dispatch Alerts</h3>
                                <div className="space-y-4">
                                    {orders.slice(0, 3).map(o => (
                                        <div key={o.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 font-black">
                                                <Truck size={18}/>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-white truncate uppercase">{customers.find(c => c.id === o.buyerId)?.businessName}</p>
                                                <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">{o.status} • {new Date(o.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-10 border-t border-white/5 relative z-10 bg-indigo-600/10">
                            <button onClick={() => navigate('/contacts')} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-3 transition-all active:scale-95">
                                <Users size={18}/> Manage All Buyers <ArrowRight size={16}/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'SCANNER' && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
            <AiOpportunityMatcher user={user} />
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <div className="animate-in fade-in duration-300">
          <SettingsComponent user={user} onRefreshUser={loadData} />
        </div>
      )}

      {/* KPI DRILL DOWN VIEWS */}
      <LiveDetailOverlay 
        isOpen={liveDetailView === 'ORDERS'} 
        onClose={() => setLiveDetailView(null)}
        title="Live Order Manifest"
        subtitle="Current trading day incoming trades"
        icon={Activity}
      >
          <div className="space-y-4">
              {marketStats.todaysOrders?.length === 0 ? (
                  <p className="text-center py-20 text-gray-400 font-black uppercase text-xs">No orders logged today</p>
              ) : marketStats.todaysOrders?.map((o: any) => (
                  <div key={o.id} className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner-sm">
                              {customers.find(c => c.id === o.buyerId)?.businessName.charAt(0)}
                          </div>
                          <div>
                              <p className="font-black text-gray-900 uppercase text-sm">{customers.find(c => c.id === o.buyerId)?.businessName}</p>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Ref: #{o.id.split('-').pop()} • {o.items.length} Items</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="font-black text-gray-900 text-lg tracking-tighter">${o.totalAmount.toFixed(2)}</p>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${o.status === 'Confirmed' ? 'text-blue-500' : 'text-orange-500'}`}>{o.status}</span>
                      </div>
                  </div>
              ))}
          </div>
      </LiveDetailOverlay>

      <LiveDetailOverlay 
        isOpen={liveDetailView === 'BUYERS'} 
        onClose={() => setLiveDetailView(null)}
        title="Demand Matching Engine"
        subtitle="Network buyers sourcing your stock"
        icon={UserCheck2}
      >
          <div className="space-y-4">
              {marketStats.buyerMatches?.length === 0 ? (
                  <p className="text-center py-20 text-gray-400 font-black uppercase text-xs">No matching buyers detected</p>
              ) : marketStats.buyerMatches?.map((b: any) => (
                  <div key={b.id} className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner-sm">
                              {b.businessName.charAt(0)}
                          </div>
                          <div>
                              <p className="font-black text-gray-900 uppercase text-sm">{b.businessName}</p>
                              <div className="flex gap-2 mt-1.5">
                                  {b.activeBuyingInterests?.slice(0,3).map((interest: string) => (
                                      <span key={interest} className="px-2 py-0.5 bg-gray-50 text-gray-400 border border-gray-100 rounded text-[7px] font-black uppercase">{interest}</span>
                                  ))}
                              </div>
                          </div>
                      </div>
                      <button onClick={() => navigate('/contacts')} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-black transition-all">
                          <MessageSquare size={18}/>
                      </button>
                  </div>
              ))}
          </div>
      </LiveDetailOverlay>

      <LiveDetailOverlay 
        isOpen={liveDetailView === 'DELIVERIES'} 
        onClose={() => setLiveDetailView(null)}
        title="Dispatch Logistics Feed"
        subtitle="Orders currently in road transit"
        icon={Truck}
      >
          <div className="space-y-4">
              {marketStats.onRoadOrders?.length === 0 ? (
                  <p className="text-center py-20 text-gray-400 font-black uppercase text-xs">No active runs on the road</p>
              ) : marketStats.onRoadOrders?.map((o: any) => (
                  <div key={o.id} className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                  <Truck size={20}/>
                              </div>
                              <div>
                                  <p className="font-black text-gray-900 uppercase text-xs">{customers.find(c => c.id === o.buyerId)?.businessName}</p>
                                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Driver: {o.logistics?.driverName || 'External Hub'}</p>
                              </div>
                          </div>
                          <span className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest animate-pulse">SHIPPED</span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                          <MapPin size={14} className="text-indigo-400"/>
                          <p className="text-[10px] font-black text-gray-500 uppercase truncate">{o.logistics?.deliveryLocation}</p>
                      </div>
                  </div>
              ))}
          </div>
      </LiveDetailOverlay>

      <LiveDetailOverlay 
        isOpen={liveDetailView === 'REVENUE'} 
        onClose={() => setLiveDetailView(null)}
        title="Daily Revenue Audit"
        subtitle="Breakdown of today's trade volume"
        icon={DollarSign}
      >
          <div className="space-y-8">
              <div className="text-center py-10 bg-[#0B1221] text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">Aggregate Volume</p>
                  <h3 className="text-6xl font-black tracking-tighter">${marketStats.myRevenueToday?.toLocaleString()}</h3>
                  <div className="mt-6 flex justify-center gap-4">
                      <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Trades</p>
                          <p className="text-xl font-black">{marketStats.todaysOrders?.length}</p>
                      </div>
                      <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Avg Tick</p>
                          <p className="text-xl font-black">${marketStats.todaysOrders?.length > 0 ? (marketStats.myRevenueToday / marketStats.todaysOrders.length).toFixed(0) : 0}</p>
                      </div>
                  </div>
              </div>

              <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Line Item Settlements</h4>
                  {marketStats.todaysOrders?.map((o: any) => (
                      <div key={o.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div>
                              <p className="text-[10px] font-black text-gray-900 uppercase truncate max-w-[150px]">{customers.find(c => c.id === o.buyerId)?.businessName}</p>
                              <p className="text-[8px] text-gray-400 font-bold uppercase">{new Date(o.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                          <p className="font-black text-emerald-600 text-sm tracking-tight">+${o.totalAmount.toFixed(2)}</p>
                      </div>
                  ))}
              </div>
          </div>
      </LiveDetailOverlay>

      <OrderFulfillmentModal 
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        products={products}
        customers={customers}
        onUpdate={loadData}
      />

      {selectedPriceRequest && (
        <WholesalerPriceRequestModal 
            isOpen={!!selectedPriceRequest}
            onClose={() => setSelectedPriceRequest(null)}
            request={selectedPriceRequest}
            onComplete={loadData}
        />
      )}
    </div>
  );
};

const ArrowLeft = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
const UserCheck2 = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
);
