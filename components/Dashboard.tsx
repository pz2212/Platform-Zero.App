
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Order, Product, Customer, UserRole, InventoryItem, Driver, Packer, AppNotification, SupplierPriceRequest, ProcurementRequest } from '../types';
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
  ShoppingCart,
  Box,
  Layers,
  Info,
  Radio,
  ZapOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatDialog } from './ChatDialog';

interface DashboardProps {
  user: User;
}

// RESTORED: Sourcing Hub Drawer
const SourcingHubDrawer = ({ isOpen, onClose, productId, products, currentUser }: { isOpen: boolean, onClose: () => void, productId: string | null, products: Product[], currentUser: User }) => {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [pingingId, setPingingId] = useState<string | null>(null);
    const [chatTarget, setChatTarget] = useState<any>(null);
    const [requestForms, setRequestForms] = useState<Record<string, { qty: string, date: string, time: string }>>({});
    
    const product = products.find(p => p.id === productId);

    useEffect(() => {
        if (!productId) return;
        const allUsers = mockService.getAllUsers();
        const allInventory = mockService.getAllInventory();
        
        const potentialSuppliers = allUsers.filter(u => 
            u.id !== currentUser.id && 
            (u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER) &&
            u.activeSellingInterests?.some(interest => 
                product?.name.toLowerCase().includes(interest.toLowerCase()) ||
                interest.toLowerCase().includes(product?.name.toLowerCase() || '')
            )
        ).map(u => {
            const stockItem = allInventory.find(i => i.ownerId === u.id && i.productId === productId && i.status === 'Available');
            return { ...u, hasStock: !!stockItem };
        });

        setSuppliers(potentialSuppliers.sort((a, b) => (b.hasStock ? 1 : 0) - (a.hasStock ? 1 : 0)));
        const initialForms: Record<string, any> = {};
        potentialSuppliers.forEach(s => {
            initialForms[s.id] = { qty: '', date: new Date().toISOString().split('T')[0], time: '06:00' };
        });
        setRequestForms(initialForms);
    }, [productId, currentUser.id]);

    if (!isOpen || !product) return null;

    const handleFormChange = (supplierId: string, field: string, value: string) => {
        setRequestForms(prev => ({ ...prev, [supplierId]: { ...prev[supplierId], [field]: value } }));
    };

    const handleRequestPrice = async (supplier: any) => {
        const formData = requestForms[supplier.id];
        if (!formData.qty) return alert("Please specify quantity.");
        setPingingId(supplier.id);
        const request: ProcurementRequest = {
            id: `proc-${Date.now()}-${supplier.id}`,
            buyerId: currentUser.id,
            supplierId: supplier.id,
            productId: product.id,
            productName: product.name,
            quantity: parseFloat(formData.qty),
            requiredDate: formData.date,
            requiredTime: formData.time,
            status: 'PENDING',
            timestamp: new Date().toISOString()
        };
        mockService.addProcurementRequest(request);
        await new Promise(r => setTimeout(r, 1200));
        mockService.addAppNotification(supplier.id, 'URGENT: Price Request', `${currentUser.businessName} needs ${formData.qty}kg of ${product.name}.`, 'PRICE_REQUEST');
        setPingingId(null);
        alert(`Request sent to ${supplier.businessName}!`);
    };

    return (
        <>
            <div className="fixed inset-0 z-[400] flex justify-end animate-in fade-in duration-300">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
                <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                <Search size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">Sourcing Hub</h2>
                                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-2">Network for {product.name}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-all text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-200">
                            <X size={28} strokeWidth={2.5}/>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
                        <div className="space-y-4">
                            {suppliers.map(s => (
                                <div key={s.id} className={`p-6 rounded-[2.5rem] border-2 transition-all ${s.hasStock ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-50 bg-white opacity-60'}`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg bg-gray-50">{s.businessName.charAt(0)}</div>
                                            <div>
                                                <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">{s.businessName}</h4>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.role}</p>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${s.hasStock ? 'bg-emerald-500 border-emerald-400 text-white animate-pulse' : 'bg-gray-100 border-gray-100 text-gray-400'}`}>
                                            {s.hasStock ? 'LIVE STOCK' : 'OUT OF STOCK'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity (kg)</label>
                                            <input type="number" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none" value={requestForms[s.id]?.qty || ''} onChange={(e) => handleFormChange(s.id, 'qty', e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
                                            <input type="date" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none" value={requestForms[s.id]?.date || ''} onChange={(e) => handleFormChange(s.id, 'date', e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Time</label>
                                            <input type="time" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none" value={requestForms[s.id]?.time || ''} onChange={(e) => handleFormChange(s.id, 'time', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRequestPrice(s)} disabled={pingingId === s.id} className="flex-1 py-4 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                                            {pingingId === s.id ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
                                            Request Price
                                        </button>
                                        <button onClick={() => setChatTarget(s)} className="px-5 bg-white border-2 border-gray-100 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all"><MessageCircle size={20}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {chatTarget && <ChatDialog isOpen={!!chatTarget} onClose={() => setChatTarget(null)} orderId="SOURCING-PING" issueType={`Sourcing Inquiry: ${product.name}`} repName={chatTarget.businessName} />}
        </>
    );
};

// RESTORED: KPI Overlays
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
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">{children}</div>
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
                    <button onClick={onClose} className="px-12 py-3 bg-[#0F172A] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg">Close View</button>
                </div>
            </div>
        </div>
    );
};

// RESTORED: Order Fulfillment Modal
const OrderFulfillmentModal = ({ isOpen, onClose, order, products, customers, onUpdate }: any) => {
    const [selectedPacker, setSelectedPacker] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    if (!isOpen || !order) return null;
    const buyer = customers.find((c: any) => c.id === order.buyerId);
    const handleAccept = async () => { setIsProcessing(true); mockService.acceptOrderV2(order.id); await new Promise(r => setTimeout(r, 600)); setIsProcessing(false); onUpdate(); };
    const handlePack = async () => { if (!selectedPacker) return alert("Assign a packer first."); setIsProcessing(true); mockService.packOrder(order.id, selectedPacker); await new Promise(r => setTimeout(r, 600)); setIsProcessing(false); onUpdate(); };
    const handleDispatch = async () => { if (!selectedDriver) return alert("Assign a driver first."); setIsProcessing(true); const targetOrder = mockService.getOrders('u1').find(o => o.id === order.id); if (targetOrder) { targetOrder.status = 'Shipped'; targetOrder.shippedAt = new Date().toISOString(); targetOrder.logistics = { ...targetOrder.logistics, driverName: selectedDriver }; } await new Promise(r => setTimeout(r, 600)); setIsProcessing(false); onUpdate(); onClose(); };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 border border-gray-100 flex flex-col max-h-[90vh]">
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
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><FileText size={14}/> PRODUCT PACKING LIST</h3>
                            <div className="divide-y divide-gray-50 border border-gray-100 rounded-3xl overflow-hidden bg-gray-50/30">
                                {order.items.map((item: any, idx: number) => {
                                    const p = products.find((prod: any) => prod.id === item.productId);
                                    return (
                                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-white transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shrink-0"><img src={p?.imageUrl} className="w-full h-full object-cover" /></div>
                                                <div><p className="font-black text-gray-900 text-sm uppercase truncate max-w-[120px]">{p?.name}</p><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p?.variety}</p></div>
                                            </div>
                                            <div className="text-right"><p className="font-black text-gray-900 text-lg tracking-tighter">{item.quantityKg}{p?.unit || 'kg'}</p><p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">${item.pricePerKg.toFixed(2)}/u</p></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-8">
                        {order.status === 'Pending' ? (
                            <div className="bg-orange-50 border border-orange-100 p-8 rounded-[2rem] text-center space-y-4">
                                <Clock size={40} className="mx-auto text-orange-400 animate-pulse" />
                                <h4 className="text-xl font-black text-orange-900 uppercase tracking-tight">Acceptance Required</h4>
                                <button onClick={handleAccept} disabled={isProcessing} className="w-full py-5 bg-[#043003] hover:bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all">{isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm Availability'}</button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className={`p-8 rounded-[2rem] border transition-all ${order.status === 'Confirmed' ? 'bg-white border-indigo-200 shadow-lg' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                    <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest mb-4">Assign Packing</h4>
                                    <select disabled={order.status !== 'Confirmed'} className="w-full p-4 bg-white border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest mb-4" value={selectedPacker} onChange={(e) => setSelectedPacker(e.target.value)}>
                                        <option value="">Choose Personnel...</option>
                                        <option value="Alex Packer">Alex Packer</option>
                                        <option value="Sam Sort">Sam Sort</option>
                                    </select>
                                    {order.status === 'Confirmed' && <button onClick={handlePack} disabled={!selectedPacker} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest">Mark as Packed</button>}
                                </div>
                                <div className={`p-8 rounded-[2rem] border transition-all ${order.status === 'Ready for Delivery' ? 'bg-white border-emerald-200 shadow-lg' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                    <h4 className="font-black text-gray-900 uppercase text-sm tracking-widest mb-4">Dispatch Fleet</h4>
                                    <select disabled={order.status !== 'Ready for Delivery'} className="w-full p-4 bg-white border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest mb-4" value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
                                        <option value="">Assign Driver...</option>
                                        <option value="Dave Transit">Dave Transit</option>
                                        <option value="Route Hub">External: PZ Hub</option>
                                    </select>
                                    {order.status === 'Ready for Delivery' && <button onClick={handleDispatch} disabled={!selectedDriver} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest">Confirm Dispatch</button>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const LiveActivitySnapshot = ({ stats, onCardClick }: any) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-12 max-w-screen-2xl">
            {[
                { id: 'ORDERS', label: 'Orders Today', value: stats.ordersToday || 0, icon: Activity, bg: 'bg-blue-50', color: 'text-blue-500' },
                { id: 'BUYERS', label: 'Wholesalers', value: stats.wholesalers || 0, icon: Globe, bg: 'bg-indigo-50', color: 'text-indigo-500' },
                { id: 'DELIVERIES', label: 'On the Road', value: stats.deliveriesOnRoad || 0, icon: Truck, bg: 'bg-emerald-50', color: 'text-emerald-500' },
                { id: 'REVENUE', label: 'Revenue', value: stats.myRevenueToday >= 1000 ? (stats.myRevenueToday / 1000).toFixed(1) + 'k' : stats.myRevenueToday?.toLocaleString() || '0', icon: DollarSign, bg: 'bg-emerald-50', color: 'text-emerald-500', isCurrency: true }
            ].map(kpi => (
                <button key={kpi.id} onClick={() => onCardClick(kpi.id)} className="bg-white p-4 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all aspect-square md:aspect-auto md:h-40 text-left active:scale-[0.98]">
                    <div><p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{kpi.label}</p></div>
                    <div className="flex justify-between items-end">
                        <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">{kpi.isCurrency ? `$${kpi.value}` : kpi.value}</h3>
                        <div className={`p-2 md:p-3 ${kpi.bg} ${kpi.color} rounded-xl group-hover:scale-110 transition-transform`}><kpi.icon size={18} /></div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  // RESTORED: Tab management for Orders vs Scanner
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'SCANNER'>('DASHBOARD');
  const [orderSubTab, setOrderSubTab] = useState<'INCOMING' | 'PROCESSING' | 'ACTIVE' | 'HISTORY'>('INCOMING');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pendingPriceRequests, setPendingPriceRequests] = useState<SupplierPriceRequest[]>([]);
  const [selectedPriceRequest, setSelectedPriceRequest] = useState<SupplierPriceRequest | null>(null);
  const [marketStats, setMarketStats] = useState<any>({});
  
  const [sourcingProductId, setSourcingProductId] = useState<string | null>(null);
  const [liveDetailView, setLiveDetailView] = useState<'ORDERS' | 'BUYERS' | 'DELIVERIES' | 'REVENUE' | null>(null);

  const products = mockService.getAllProducts();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = () => {
    const allSellingOrders = mockService.getOrders(user.id).filter(o => o.sellerId === user.id);
    const myInventory = mockService.getInventory(user.id);
    setOrders(allSellingOrders);
    setInventory(myInventory);
    setCustomers(mockService.getCustomers());
    const requests = mockService.getSupplierPriceRequests(user.id).filter(r => r.status === 'PENDING');
    setPendingPriceRequests(requests);
    const today = new Date().toDateString();
    const myTodaysOrders = allSellingOrders.filter(o => new Date(o.date).toDateString() === today);
    const myRevenueToday = myTodaysOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const deliveriesOnRoad = allSellingOrders.filter(o => o.status === 'Shipped').length;
    const sellingInterests = user.activeSellingInterests || [];
    const allBuyers = mockService.getAllUsers().filter(u => u.id !== user.id && (u.role === UserRole.WHOLESALER || u.role === UserRole.GROCERY || u.role === UserRole.CONSUMER));
    const matchedBuyers = allBuyers.filter(b => b.activeBuyingInterests?.some(interest => sellingInterests.some(myStock => myStock.toLowerCase() === interest.toLowerCase())));

    setMarketStats({
        ordersToday: myTodaysOrders.length,
        wholesalers: matchedBuyers.length,
        myRevenueToday,
        deliveriesOnRoad,
        todaysOrders: myTodaysOrders,
        onRoadOrders: allSellingOrders.filter(o => o.status === 'Shipped'),
        buyerMatches: matchedBuyers
    });
  };

  // RESTORED: Inventory vs Demand Planner Data
  const plannerData = useMemo(() => {
      return products.map(p => {
          const onHand = inventory.filter(inv => inv.productId === p.id && inv.status === 'Available').reduce((sum, item) => sum + item.quantityKg, 0);
          const today = new Date().toDateString();
          const required = orders.filter(o => new Date(o.date).toDateString() === today && !['Delivered', 'Cancelled'].includes(o.status)).flatMap(o => o.items).filter(item => item.productId === p.id).reduce((sum, item) => sum + item.quantityKg, 0);
          const shortfall = Math.max(0, required - onHand);
          const coverage = required === 0 ? 100 : Math.min(100, (onHand / required) * 100);
          return { ...p, onHand, required, shortfall, coverage };
      }).filter(item => item.onHand > 0 || item.required > 0);
  }, [products, inventory, orders]);

  const incomingQueue = orders.filter(o => o.status === 'Pending');
  const processingQueue = orders.filter(o => ['Confirmed', 'Ready for Delivery'].includes(o.status));
  const activeFulfillment = orders.filter(o => o.status === 'Shipped');
  const pastOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));
  const currentSellingList = orderSubTab === 'INCOMING' ? incomingQueue : orderSubTab === 'PROCESSING' ? processingQueue : orderSubTab === 'ACTIVE' ? activeFulfillment : pastOrders;

  return (
    <div className="animate-in fade-in duration-500 min-h-screen pb-20">
      
      {/* HEADER SECTION - Simplified to Blueprint Title + Blue Scanner Button */}
      <div className="mb-6 border-b border-gray-100 pb-6 px-2 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
            <h1 className="text-[32px] md:text-[44px] font-black text-[#0F172A] tracking-tighter uppercase leading-none">Partner Operations</h1>
            <p className="text-gray-400 font-bold text-xs tracking-tight mt-2 flex items-center gap-3 uppercase">
                Management Console <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span> {user.businessName}
            </p>
        </div>
        
        {/* NEW: PROMINENT BLUE SCANNER BUTTON */}
        <button 
            onClick={() => setCurrentView(currentView === 'DASHBOARD' ? 'SCANNER' : 'DASHBOARD')}
            className={`px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 border-2 ${
                currentView === 'SCANNER' 
                ? 'bg-white border-blue-600 text-blue-600' 
                : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
            }`}
        >
            {currentView === 'SCANNER' ? <ArrowLeft size={20} strokeWidth={3}/> : <Camera size={20} strokeWidth={3}/>}
            <span>{currentView === 'SCANNER' ? 'RETURN TO OPS' : 'VISUAL SCANNER'}</span>
        </button>
      </div>

      {currentView === 'DASHBOARD' ? (
        <div className="px-2">
            <LiveActivitySnapshot stats={marketStats} onCardClick={setLiveDetailView} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* RESTORED LEFT SIDE: DEMAND MATRIX */}
                <div className="xl:col-span-4 space-y-8 animate-in slide-in-from-left-4 duration-700">
                    <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[700px]">
                        <div className="p-10 border-b border-gray-100 bg-gray-50/50 shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Layers size={28}/></div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Demand Matrix</h2>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Inventory vs. Today's Fulfillment</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {plannerData.map(item => (
                                <div key={item.id} onClick={() => setSourcingProductId(item.id)} className="p-6 rounded-[2.5rem] border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-xl transition-all group relative cursor-pointer active:scale-[0.99]">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shrink-0"><img src={item.imageUrl} className="w-full h-full object-cover" /></div>
                                            <div><h4 className="font-black text-gray-900 text-sm uppercase leading-tight group-hover:text-indigo-600 transition-colors">{item.name}</h4><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.variety}</p></div>
                                        </div>
                                        {item.shortfall > 0 && <div className="p-2 rounded-xl border bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all"><ShoppingCart size={16}/></div>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">On Hand</p><p className="text-xl font-black text-gray-900 tracking-tighter">{item.onHand}kg</p></div>
                                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100"><p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Demand</p><p className="text-xl font-black text-indigo-700 tracking-tighter">{item.required}kg</p></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 rounded-full ${item.coverage < 100 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{width: `${item.coverage}%`}}></div></div>
                                        {item.shortfall > 0 && <div className="flex items-center gap-1.5 mt-2 text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse"><AlertTriangle size={12}/> DEFICIT: {item.shortfall}kg</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* RESTORED RIGHT SIDE: FULFILLMENT PIPELINE */}
                <div className="xl:col-span-8 space-y-8 animate-in slide-in-from-left-4 duration-700">
                    <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
                        <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-8 shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-md border border-gray-100 shrink-0"><LayoutGrid size={28}/></div>
                                <div><h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Fulfillment Pipeline</h2><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Managing your direct sales trade flow</p></div>
                            </div>
                            <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 border border-gray-200 shadow-inner-sm w-full md:w-auto overflow-x-auto no-scrollbar">
                                {[
                                    { id: 'INCOMING', label: 'Incoming', count: incomingQueue.length, icon: Bell, color: 'text-orange-500' },
                                    { id: 'PROCESSING', label: 'Processing', count: processingQueue.length, icon: Package, color: 'text-indigo-500' },
                                    { id: 'ACTIVE', label: 'Active Runs', count: activeFulfillment.length, icon: Truck, color: 'text-emerald-500' },
                                    { id: 'HISTORY', label: 'History', count: null, icon: History, color: 'text-gray-400' }
                                ].map((sub) => (
                                    <button key={sub.id} onClick={() => setOrderSubTab(sub.id as any)} className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${orderSubTab === sub.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                        <sub.icon size={14} className={orderSubTab === sub.id ? sub.color : 'text-gray-400'}/> {sub.label} 
                                        {sub.count !== null && sub.count > 0 && <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white ${sub.color.replace('text-', 'bg-')}`}>{sub.count}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
                            {currentSellingList.map(order => {
                                const buyer = customers.find(c => c.id === order.buyerId);
                                return (
                                    <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group animate-in slide-in-from-bottom-2">
                                        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                                            <div className="flex items-center gap-6 flex-1 w-full">
                                                <div className="w-16 h-16 rounded-[1.75rem] bg-gray-50 flex items-center justify-center text-gray-400 font-black text-2xl shadow-inner-sm border border-gray-50 uppercase shrink-0">{buyer?.businessName.charAt(0)}</div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none truncate mb-2">{buyer?.businessName}</h4>
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${order.status === 'Shipped' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>{order.status}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-10 w-full lg:w-auto justify-between lg:justify-end">
                                                <div className="text-right"><p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Total</p><p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">${order.totalAmount.toFixed(2)}</p></div>
                                                <button onClick={() => setSelectedOrder(order)} className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${order.status === 'Pending' ? 'bg-[#043003] text-white' : 'bg-white border-2 border-indigo-100 text-indigo-600'}`}>
                                                    {order.status === 'Pending' ? 'Accept Order' : 'Manage Ops'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-500">
            <AiOpportunityMatcher user={user} />
        </div>
      )}

      {/* MODALS & DRAWERS */}
      <LiveDetailOverlay isOpen={liveDetailView === 'ORDERS'} onClose={() => setLiveDetailView(null)} title="Live Order Manifest" subtitle="Incoming trades" icon={Activity}>
          {marketStats.todaysOrders?.map((o: any) => (
              <div key={o.id} className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all mb-4">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg">{customers.find(c => c.id === o.buyerId)?.businessName.charAt(0)}</div>
                      <div><p className="font-black text-gray-900 uppercase text-sm">{customers.find(c => c.id === o.buyerId)?.businessName}</p></div>
                  </div>
                  <p className="font-black text-gray-900 text-lg tracking-tighter">${o.totalAmount.toFixed(2)}</p>
              </div>
          ))}
      </LiveDetailOverlay>

      <SourcingHubDrawer isOpen={!!sourcingProductId} onClose={() => setSourcingProductId(null)} productId={sourcingProductId} products={products} currentUser={user} />
      <OrderFulfillmentModal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} order={selectedOrder} products={products} customers={customers} onUpdate={loadData} />
      {selectedPriceRequest && <WholesalerPriceRequestModal isOpen={!!selectedPriceRequest} onClose={() => setSelectedPriceRequest(null)} request={selectedPriceRequest} onComplete={loadData} />}
    </div>
  );
};

const ArrowLeft = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
