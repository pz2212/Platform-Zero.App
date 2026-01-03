
import React, { useState, useEffect, useRef } from 'react';
import { User, Order, Product, Customer, SupplierPriceRequest, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { AiOpportunityMatcher } from './AiOpportunityMatcher';
import { DeliListingForm } from './DeliListingForm';
import { Settings as SettingsComponent } from './Settings';
import { InviteBuyerModal } from './InviteBuyerModal';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';
import { 
  Package, Truck, MapPin, LayoutDashboard, 
  Users, Clock, CheckCircle, X, Mail, Smartphone, Building,
  Settings, Calculator, FileText, ChevronRight, LayoutGrid, Search, Bell, History, Calendar, Printer, AlertTriangle, TrendingUp, Globe, Star, UserPlus, ArrowUpRight,
  Plus, Store, MessageSquare, Camera, Image as ImageIcon, Loader2, Send, ChevronDown
} from 'lucide-react';

interface DashboardProps {
  user: User;
}

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

// Comprehensive Data Pulled from SA Produce Market Directory (Wholesalers & Warehouse Categories)
const SA_PRODUCE_MARKET_SUPPLIERS = [
    { name: 'AMJ Produce', mobile: '08 8349 4500', email: 'sales@amjproduce.com.au', location: 'Burma Drive, Pooraka', specialty: 'Fruit & Veg' },
    { name: 'Bache Bros', mobile: '08 8349 4555', email: 'bachebros@internode.on.net', location: 'Pooraka Market', specialty: 'Potatoes & Onions' },
    { name: 'Ceravolo Orchards', mobile: '08 8389 6188', email: 'info@ceravolo.com.au', location: 'Adelaide Hills / Pooraka', specialty: 'Apples, Pears, Cherries' },
    { name: 'Costa Group (SA)', mobile: '08 8349 4544', email: 'sa.sales@costagroup.com.au', location: 'Market Complex, Pooraka', specialty: 'Global Produce' },
    { name: 'GD Produce', mobile: '08 8349 4444', email: 'sales@gdproduce.com.au', location: 'Wholesale Store 12', specialty: 'Leafy Greens' },
    { name: 'Mackays Produce', mobile: '08 8349 4333', email: 'sales@mackays.com.au', location: 'Wholesale Store 45', specialty: 'Bananas & Tropical' },
    { name: 'Perfection Fresh', mobile: '08 8349 4222', email: 'sales@perfection.com.au', location: 'Pooraka Hub', specialty: 'Branded Specialty' },
    { name: 'Quality Produce International', mobile: '08 8349 4111', email: 'info@qpi.com.au', location: 'Pooraka Market Store', specialty: 'Export Quality' },
    { name: 'SA Potato Company', mobile: '08 8349 4000', email: 'admin@sapota.com.au', location: 'Potatoes Central', specialty: 'Potatoes' },
    { name: 'Vizzarri Farms', mobile: '08 8349 3999', email: 'admin@vizzarri.com.au', location: 'Pooraka HQ', specialty: 'Fresh Herbs' },
];

const SendPhotoOfferModal = ({ isOpen, onClose, supplier, products }: any) => {
    const [image, setImage] = useState<string | null>(null);
    const [price, setPrice] = useState('');
    const [productId, setProductId] = useState('');
    const [minOrder, setMinOrder] = useState('');
    const [logisticsPrice, setLogisticsPrice] = useState('');
    const [description, setDescription] = useState('');
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setImage(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSend = () => {
        if (!supplier?.mobile) {
            alert("No mobile number attached to this profile.");
            return;
        }

        setIsSending(true);
        
        const productObj = products.find((p: any) => p.id === productId);
        const productName = productObj?.name || "Fresh Produce";
        const link = generateProductDeepLink('quote', Math.random().toString(36).substr(2, 9));
        
        const message = `PZ OFFER: ${productName}
Price: $${price}/kg
Min Order: ${minOrder}kg
Logistics: $${logisticsPrice}
Description: ${description}

View product photo & accept offer here: ${link}`;

        triggerNativeSms(supplier.mobile, message);

        setTimeout(() => {
            setIsSending(false);
            alert(`Offer dispatched to ${supplier.name}!`);
            onClose();
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase">Send Photo Offer</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">To: {supplier.name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${image ? 'border-emerald-500' : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'}`}
                    >
                        {image ? (
                            <img src={image} className="w-full h-full object-cover" alt="Preview"/>
                        ) : (
                            <div className="text-center">
                                <Camera size={32} className="text-gray-300 mx-auto mb-2"/>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Product Photo</p>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile}/>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Proposed Product</label>
                            <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm text-gray-900 focus:bg-white transition-all outline-none" value={productId} onChange={e => setProductId(e.target.value)}>
                                <option value="">Select Category...</option>
                                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Product Description</label>
                            <textarea 
                                placeholder="e.g. Premium Grade A, harvested this morning..." 
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm text-gray-900 focus:bg-white transition-all outline-none h-20 resize-none"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Direct Offer Price ($/kg)</label>
                                <input type="number" placeholder="0.00" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm text-gray-900 focus:bg-white transition-all outline-none" value={price} onChange={e => setPrice(e.target.value)}/>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Min Order (kg)</label>
                                <input type="number" placeholder="0" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm text-gray-900 focus:bg-white transition-all outline-none" value={minOrder} onChange={e => setMinOrder(e.target.value)}/>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Logistics Price ($)</label>
                                <input type="number" placeholder="0.00" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm text-gray-900 focus:bg-white transition-all outline-none" value={logisticsPrice} onChange={e => setLogisticsPrice(e.target.value)}/>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSend}
                        disabled={isSending || !image || !price || !productId}
                        className="w-full py-4 bg-[#043003] hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSending ? <Loader2 className="animate-spin" size={18}/> : <><Send size={16}/> Dispatch Offer</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Order Management');
  const [orderSubTab, setOrderSubTab] = useState('PENDING');
  const [selectedState, setSelectedState] = useState('SA');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedSupplierForPhoto, setSelectedSupplierForPhoto] = useState<any>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const products = mockService.getAllProducts();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = () => {
    const allOrders = mockService.getOrders(user.id).filter(o => o.sellerId === user.id);
    setOrders(allOrders);
    setCustomers(mockService.getCustomers());
  };

  const handleAcceptOrder = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    mockService.acceptOrderV2(orderId);
    loadData();
    alert("Order Accepted!");
  };

  const pendingAcceptance = orders.filter(o => o.status === 'Pending');
  const acceptedOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Ready for Delivery' || o.status === 'Shipped');
  const fulfilledOrders = orders.filter(o => o.status === 'Delivered');

  const displayedOrders = orderSubTab === 'PENDING' ? pendingAcceptance : orderSubTab === 'ACCEPTED' ? acceptedOrders : fulfilledOrders;

  const filteredCustomers = customers.filter(c => 
    c.connectedSupplierId === user.id && 
    (c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSaSuppliers = selectedState === 'SA' 
    ? SA_PRODUCE_MARKET_SUPPLIERS.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="animate-in fade-in duration-500 min-h-screen">
      <div className="mb-10">
        <div className="flex justify-between items-start mb-10">
            <div>
                <h1 className="text-[32px] font-black text-[#0F172A] tracking-tight">Partner Operations</h1>
                <p className="text-gray-500 font-medium text-sm">Manage orders, logistics, and deli storefront.</p>
            </div>
            <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border border-blue-100 rounded-xl text-blue-600 font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95 group">
                <Truck size={18}/>
                Driver Logistics
            </button>
        </div>

        <div className="flex items-center gap-8 border-b border-gray-100 overflow-x-auto no-scrollbar whitespace-nowrap -mx-6 px-6 md:mx-0 md:px-0">
            {[
                { id: 'Order Management', icon: LayoutGrid },
                { id: 'Sell to Deli', icon: Store },
                { id: 'Scanner', icon: Camera },
                { id: 'Customers', icon: Users },
                { id: 'Suppliers', icon: Store },
                { id: 'Settings', icon: Settings }
            ].map((tab) => (
            <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                className={`flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-widest transition-all relative shrink-0 ${
                    activeTab === tab.id 
                    ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-gray-900 after:rounded-t-full' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
            >
                <tab.icon size={16} />
                {tab.id}
            </button>
            ))}
        </div>
      </div>

      <div className="pb-20 space-y-12">
        {activeTab === 'Order Management' && (
          <div className="space-y-10">
            {pendingAcceptance.length > 0 && (
                <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-[2rem] p-8 space-y-6 animate-in slide-in-from-top-4 duration-500 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 border border-[#FECDD3] shadow-sm">
                            <AlertTriangle size={24}/>
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-[#9F1239] uppercase tracking-widest">Orders Awaiting Acceptance</h2>
                            <p className="text-xs text-[#E11D48] font-bold">{pendingAcceptance.length} orders need attention</p>
                        </div>
                    </div>
                    <button onClick={() => setOrderSubTab('PENDING')} className="w-full py-4 bg-[#F43F5E] hover:bg-[#E11D48] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-100 transition-all active:scale-[0.98]">
                        Review All Pending
                    </button>
                </div>
            )}

            <div className="space-y-6">
                <div className="bg-gray-100/50 p-1 rounded-xl inline-flex gap-1 border border-gray-200/50 overflow-x-auto no-scrollbar whitespace-nowrap max-w-full">
                    <button onClick={() => setOrderSubTab('PENDING')} className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2 shrink-0 ${orderSubTab === 'PENDING' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                        Pending {pendingAcceptance.length > 0 && <span className="bg-orange-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">{pendingAcceptance.length}</span>}
                    </button>
                    <button onClick={() => setOrderSubTab('ACCEPTED')} className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-[0.1em] transition-all shrink-0 ${orderSubTab === 'ACCEPTED' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                        Accepted
                    </button>
                    <button onClick={() => setOrderSubTab('FULFILLED')} className={`px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-[0.1em] transition-all shrink-0 ${orderSubTab === 'FULFILLED' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                        Fulfilled
                    </button>
                </div>

                <div className="space-y-4">
                    {displayedOrders.length === 0 ? (
                        <div className="py-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <CheckCircle size={48} className="mx-auto text-gray-100 mb-4"/>
                            <p className="text-gray-300 font-bold uppercase tracking-widest text-xs">Queue is clear</p>
                        </div>
                    ) : displayedOrders.map(order => {
                        const buyer = customers.find(c => c.id === order.buyerId);
                        const isExpanded = expandedOrderId === order.id;
                        
                        return (
                            <div 
                                key={order.id} 
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                className={`bg-white rounded-[2rem] border transition-all cursor-pointer overflow-hidden ${
                                    isExpanded ? 'border-gray-900 shadow-xl scale-[1.01] z-10 relative' : 'border-gray-100 shadow-sm hover:border-gray-200'
                                }`}
                            >
                                <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-6 flex-1 w-full">
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-xl shadow-inner-sm">
                                            {buyer?.businessName.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 truncate">{buyer?.businessName}</h3>
                                            <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">REF: #{order.id.split('-').pop()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Amount</p>
                                            <p className="font-black text-gray-900">${order.totalAmount.toFixed(2)}</p>
                                        </div>
                                        {order.status === 'Pending' ? (
                                            <button 
                                                onClick={(e) => handleAcceptOrder(e, order.id)}
                                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
                                            >
                                                Accept
                                            </button>
                                        ) : (
                                            <div className="px-6 py-2 rounded-lg bg-gray-50 text-gray-400 font-bold text-xs uppercase">
                                                {order.status}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'Sell to Deli' && (
          <div className="animate-in fade-in zoom-in-95 duration-500 py-8">
            <DeliListingForm user={user} onComplete={() => setActiveTab('Order Management')} />
          </div>
        )}

        {activeTab === 'Scanner' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <AiOpportunityMatcher user={user} />
          </div>
        )}

        {activeTab === 'Customers' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Customer Directory</h2>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Manage connected buyers.</p>
                </div>
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20}/>
                    <input 
                        placeholder="Search customers..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm font-bold text-sm" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map(customer => (
                    <div key={customer.id} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] hover:shadow-xl transition-all group flex flex-col justify-between min-h-[300px]">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 bg-indigo-50 rounded-[1.25rem] flex items-center justify-center font-black text-2xl text-indigo-700 shadow-inner-sm">
                                    {customer.businessName.charAt(0)}
                                </div>
                                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100">Connected</span>
                            </div>
                            <h3 className="font-black text-gray-900 text-2xl tracking-tight leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{customer.businessName}</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">{customer.category}</p>
                        </div>
                        <button className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all">Open Full Record</button>
                    </div>
                ))}
                <div onClick={() => setIsInviteModalOpen(true)} className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer min-h-[300px]">
                    <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-6"><Plus size={32} className="text-gray-300 group-hover:text-indigo-500 transition-all"/></div>
                    <h3 className="text-xl font-black text-gray-400 group-hover:text-gray-900 tracking-tight uppercase">Invite New Buyer</h3>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'Suppliers' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Market Suppliers</h2>
                </div>
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20}/>
                    <input 
                        placeholder="Search market directory..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm font-bold text-sm" 
                    />
                </div>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar mb-8 whitespace-nowrap">
                {AU_STATES.map(state => (
                    <button
                        key={state}
                        onClick={() => setSelectedState(state)}
                        className={`flex-1 min-w-[80px] py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0 ${selectedState === state ? 'bg-[#043003] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}
                    >
                        {state}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600"><Store size={24}/></div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase">{selectedState} Wholesalers</h2>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {filteredSaSuppliers.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Company Name</th>
                                    <th className="px-8 py-5">Contact Mobile</th>
                                    <th className="px-8 py-5">Market Location</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSaSuppliers.map((supplier, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-8 py-6 font-black text-gray-900 tracking-tight text-base uppercase">{supplier.name}</td>
                                        <td className="px-8 py-6 text-sm font-bold text-gray-500">{supplier.mobile}</td>
                                        <td className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-tight">{supplier.location}</td>
                                        <td className="px-8 py-6 text-right">
                                            <button onClick={() => setSelectedSupplierForPhoto(supplier)} className="p-3 bg-white border border-gray-200 text-gray-400 hover:text-orange-600 hover:border-orange-200 rounded-xl transition-all shadow-sm"><Camera size={18}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-24 text-center">
                            <Globe size={48} className="mx-auto text-gray-100 mb-6"/>
                            <h3 className="text-xl font-black text-gray-300 uppercase tracking-tight">No Active Partners in {selectedState}</h3>
                        </div>
                    )}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="animate-in fade-in duration-300">
            <SettingsComponent user={user} onRefreshUser={() => loadData()} />
          </div>
        )}
      </div>

      <SendPhotoOfferModal 
        isOpen={!!selectedSupplierForPhoto} 
        onClose={() => setSelectedSupplierForPhoto(null)} 
        supplier={selectedSupplierForPhoto}
        products={products}
      />

      <InviteBuyerModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        wholesaler={user}
      />
    </div>
  );
};
