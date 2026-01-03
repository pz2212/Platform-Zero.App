import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, InventoryItem, Product, ChatMessage, UserRole, Customer, Order } from '../types';
import { mockService } from '../services/mockDataService';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';
import { InviteBuyerModal } from './InviteBuyerModal';
import { 
  MessageCircle, Send, Plus, X, Search, Info, 
  ShoppingBag, Link as LinkIcon, CheckCircle, Clock,
  Store, MapPin, Phone, ShieldCheck, Tag, ChevronRight, Users, UserCheck,
  ArrowLeft, UserPlus, Smartphone, Contact, Loader2, Building, Mail, BookOpen,
  Package, DollarSign, Truck, Camera, Image as ImageIcon, ChevronDown, FolderOpen,
  Sprout, ShoppingCart, MessageSquare, Globe, ArrowUpRight, HelpCircle, Activity, Heart, TrendingUp
} from 'lucide-react';

interface ContactsProps {
  user: User;
}

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

// Updated with Mobile Numbers (04xx xxx xxx) for direct SMS/Trade connectivity
const SA_PRODUCE_MARKET_SUPPLIERS = [
    { name: 'Advent Produce', mobile: '0412 888 333', email: 'advent@saproducemarket.com.au', location: 'Store 31-33', specialty: 'General Produce', type: 'Wholesaler' },
    { name: 'AMJ Produce', mobile: '0422 777 444', email: 'sales@amjproduce.com.au', location: 'Burma Drive, Pooraka', specialty: 'Fruit & Veg', type: 'Warehouse' },
    { name: 'B&C Fresh', mobile: '0433 666 555', email: 'admin@bcfresh.com.au', location: 'Store 12-14', specialty: 'Exotics', type: 'Wholesaler' },
    { name: 'Bache Bros', mobile: '0444 555 666', email: 'bachebros@internode.on.net', location: 'Store 60', specialty: 'Potatoes & Onions', type: 'Wholesaler' },
    { name: 'Ceravolo Orchards', mobile: '0455 444 777', email: 'info@ceravolo.com.au', location: 'Store 32', specialty: 'Apples & Pears', type: 'Warehouse' },
    { name: 'Costa Group (SA)', mobile: '0466 333 888', email: 'sa.sales@costagroup.com.au', location: 'Store 101', specialty: 'Global Produce', type: 'Warehouse' },
    { name: 'Favco SA', mobile: '0477 222 999', email: 'sales@favcosa.com.au', location: 'Store 41-43', specialty: 'Premium Stonefruit', type: 'Wholesaler' },
    { name: 'GD Produce', mobile: '0488 111 000', email: 'sales@gdproduce.com.au', location: 'Store 12', specialty: 'Leafy Greens', type: 'Wholesaler' },
    { name: 'George\'s Fruit & Veg', mobile: '0499 000 111', email: 'george@georges.com.au', location: 'Store 22', specialty: 'Asian Produce', type: 'Wholesaler' },
    { name: 'J.H. Fawcett', mobile: '0411 999 222', email: 'admin@jhfawcett.com.au', location: 'Store 18', specialty: 'Root Vegetables', type: 'Wholesaler' },
    { name: 'LaManna Premier', mobile: '0422 888 333', email: 'sa@lamannapremier.com.au', location: 'Store 50-55', specialty: 'Bananas & Melons', type: 'Warehouse' },
    { name: 'Mackays Produce', mobile: '0433 777 444', email: 'sales@mackays.com.au', location: 'Store 45', specialty: 'Tropical', type: 'Wholesaler' },
    { name: 'Marano\'s Produce', mobile: '0444 666 555', email: 'sales@maranos.com.au', location: 'Store 62', specialty: 'Mixed Veg', type: 'Wholesaler' },
    { name: 'Moraitis (SA)', mobile: '0455 555 666', email: 'sa@moraitis.com.au', location: 'Store 80-84', specialty: 'Potatoes & Carrots', type: 'Warehouse' },
    { name: 'Perfection Fresh', mobile: '0466 444 777', email: 'sales@perfection.com.au', location: 'Store 52', specialty: 'Branded Specialty', type: 'Wholesaler' },
    { name: 'Produce SA', mobile: '0477 333 888', email: 'admin@producesa.com.au', location: 'Store 34', specialty: 'Broccoli & Cauliflower', type: 'Wholesaler' },
    { name: 'Quality Produce International', mobile: '0488 222 999', email: 'info@qpi.com.au', location: 'Store 27', specialty: 'Citrus & Export', type: 'Wholesaler' },
    { name: 'S.A. Mushroom Co', mobile: '0499 111 000', email: 'sales@samushrooms.com.au', location: 'Store 15', specialty: 'Mushrooms', type: 'Warehouse' },
    { name: 'SA Potato Company', mobile: '0411 000 111', email: 'admin@sapota.com.au', location: 'Store 70', specialty: 'Potatoes', type: 'Warehouse' },
    { name: 'Sunfresh', mobile: '0422 999 222', email: 'sales@sunfresh.com.au', location: 'Store 90', specialty: 'Salad Mixes', type: 'Wholesaler' },
    { name: 'Thorpes Produce', mobile: '0433 888 333', email: 'admin@thorpes.com.au', location: 'Store 4', specialty: 'Seasonal Fruit', type: 'Wholesaler' },
    { name: 'Vizzarri Farms', mobile: '0444 777 444', email: 'admin@vizzarri.com.au', location: 'Store 88', specialty: 'Fresh Herbs', type: 'Wholesaler' },
];

const SendProductOfferModal = ({ isOpen, onClose, targetPartner, products }: { 
    isOpen: boolean, 
    onClose: () => void, 
    targetPartner: any, 
    products: Product[]
}) => {
    const [offerData, setOfferData] = useState({
        productId: '',
        price: '',
        unit: 'KG',
        minOrder: '',
        logisticsPrice: '0',
    });
    const [customImage, setCustomImage] = useState<string | null>(null);
    const [isSubmitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    if (!isOpen) return null;

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setCustomImage(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const mobile = targetPartner.mobile || targetPartner.phone;
        if (!mobile) { alert("No mobile number available."); return; }
        setSubmitting(true);
        const productName = products.find(p => p.id === offerData.productId)?.name || "Fresh Produce";
        const message = `PZ OFFER: ${productName}\nPrice: $${offerData.price}/${offerData.unit}\nMin Order: ${offerData.minOrder}${offerData.unit}\nView & Accept: ${generateProductDeepLink('quote', 'off-' + Date.now())}`;
        triggerNativeSms(mobile, message);
        setTimeout(() => { setSubmitting(false); alert("Offer sent via native SMS!"); onClose(); }, 800);
    };

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div><h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Direct Photo Offer</h2><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Target: {targetPartner.name || targetPartner.businessName}</p></div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2"><X size={24}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div onClick={() => fileInputRef.current?.click()} className={`h-48 border-4 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all bg-gray-50 shadow-inner-sm ${customImage ? 'border-emerald-500' : 'border-gray-200 hover:border-indigo-400'}`}>
                        {customImage ? <img src={customImage} className="w-full h-full object-cover" alt=""/> : <div className="text-center"><Camera size={32} className="text-gray-300 mx-auto mb-2"/><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Product Photo</p></div>}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile}/>
                    </div>
                    <div className="space-y-4">
                        <select required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50/10" value={offerData.productId} onChange={e => setOfferData({...offerData, productId: e.target.value})}>
                            <option value="">Select Catalog Variety...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-3">
                            <input required type="number" step="0.01" placeholder="Price ($/kg)" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50/10" value={offerData.price} onChange={e => setOfferData({...offerData, price: e.target.value})}/>
                            <input required type="number" placeholder="Min Qty (kg)" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50/10" value={offerData.minOrder} onChange={e => setOfferData({...offerData, minOrder: e.target.value})}/>
                        </div>
                    </div>
                    <button type="submit" disabled={isSubmitting || !customImage || !offerData.productId} className="w-full py-5 bg-[#043003] text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Send size={18}/> Dispatch to Buyer</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export const Contacts: React.FC<ContactsProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetId = queryParams.get('id');

  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
  const [selectedState, setSelectedState] = useState('SA');
  const [activeContact, setActiveContact] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sendProductTarget, setSendProductTarget] = useState<any>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sourcing Data
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [supplierInventory, setSupplierInventory] = useState<Record<string, InventoryItem[]>>({});
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [myCustomers, setMyCustomers] = useState<Customer[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  useEffect(() => {
    setProducts(mockService.getAllProducts());
    setMyCustomers(mockService.getCustomers());
    setAllOrders(mockService.getOrders(user.id));
    
    // Load Suppliers for sourcing view
    const allUsers = mockService.getAllUsers();
    const networkSuppliers = allUsers.filter(u => u.id !== user.id && (u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER));
    setSuppliers(networkSuppliers);
    
    const invMap: Record<string, InventoryItem[]> = {};
    networkSuppliers.forEach(s => {
        invMap[s.id] = mockService.getInventory(s.id).filter(i => i.status === 'Available');
    });
    setSupplierInventory(invMap);

    if (targetId) {
      const found = mockService.getAllUsers().find(u => u.id === targetId);
      if (found) {
        setActiveContact(found);
        setMessages(mockService.getChatMessages(user.id, targetId));
      }
    } else {
      setActiveContact(null);
    }
  }, [targetId, user.id]);

  const handleSendMessage = (text: string) => {
    if (!activeContact || !text.trim()) return;
    mockService.sendChatMessage(user.id, activeContact.id, text);
    setMessages(mockService.getChatMessages(user.id, activeContact.id));
    setInputText('');
  };

  const handlePurchaseFromBuying = (supplierId: string, item: InventoryItem) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return;
    
    const confirmMsg = `Initiate purchase for ${item.quantityKg}${product.unit || 'kg'} of ${product.name} from ${suppliers.find(s => s.id === supplierId)?.businessName}?\nTotal: $${(item.quantityKg * product.defaultPricePerKg).toFixed(2)} + $${(item.logisticsPrice || 0).toFixed(2)} logistics.`;
    if (window.confirm(confirmMsg)) {
        mockService.createInstantOrder(user.id, item, item.quantityKg, product.defaultPricePerKg);
        alert("Purchase successful! Check your Financials history.");
    }
  };

  const filteredCustomers = myCustomers.filter(c => 
    c.connectedSupplierId === user.id &&
    (c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredMarketSuppliers = selectedState === 'SA' 
    ? SA_PRODUCE_MARKET_SUPPLIERS.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const stats = useMemo(() => {
    const connected = myCustomers.filter(c => c.connectedSupplierId === user.id);
    const active = connected.filter(c => c.connectionStatus === 'Active').length;
    const totalGmv = allOrders.filter(o => o.sellerId === user.id).reduce((sum, o) => sum + o.totalAmount, 0);
    
    return { total: connected.length, active, totalGmv };
  }, [myCustomers, user.id, allOrders]);

  const getStatusConfig = (status: string | undefined) => {
      switch(status) {
          case 'Active': return { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: UserCheck };
          case 'Pending Connection': return { color: 'text-orange-600 bg-orange-50 border-orange-100', icon: Clock };
          case 'Pricing Pending': return { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: DollarSign };
          default: return { color: 'text-gray-500 bg-gray-50 border-gray-100', icon: HelpCircle };
      }
  };

  if (activeContact) {
      return (
          <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/contacts')} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ArrowLeft size={20}/></button>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg bg-indigo-100 text-indigo-700 shadow-inner-sm`}>{activeContact.businessName.charAt(0)}</div>
                <div><h2 className="font-black text-gray-900 text-xl tracking-tight leading-none uppercase">{activeContact.businessName}</h2><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{activeContact.role}</p></div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30 custom-scrollbar">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-5 rounded-[1.75rem] text-sm max-w-[75%] shadow-sm ${msg.senderId === user.id ? 'bg-[#043003] text-white rounded-br-none' : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'}`}>
                        {msg.text}
                    </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                    <MessageSquare size={48} className="opacity-10 mb-4"/>
                    <p className="text-xs font-black uppercase tracking-widest">Start the conversation</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 bg-white">
                <div className="flex gap-4">
                    <input type="text" placeholder="Type a message..." className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputText)} />
                    <button onClick={() => handleSendMessage(inputText)} className="p-4 bg-[#043003] text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"><Send size={20}/></button>
                </div>
            </div>
          </div>
      );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="px-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-[1.25rem] shadow-sm border border-gray-100 flex items-center justify-center text-[#043003]">
                {activeTab === 'customers' ? <Users size={36} /> : <Store size={36} />}
            </div>
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase leading-none">{activeTab === 'customers' ? 'Buyer Network' : 'Market Discovery'}</h1>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">{activeTab === 'customers' ? 'Connected accounts & manual lead management' : 'Explore regional markets and new wholesale buyers'}</p>
            </div>
          </div>
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder={activeTab === 'customers' ? "Search connected buyers..." : "Search wholesalers & warehouses..."} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-14 pr-8 py-5 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50/5 transition-all shadow-sm"
            />
          </div>
      </div>

      <div className="bg-gray-100/50 p-1.5 rounded-[1.5rem] inline-flex border border-gray-200 shadow-sm mx-2">
        <button onClick={() => setActiveTab('customers')} className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'customers' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}>My Customers</button>
        <button onClick={() => setActiveTab('suppliers')} className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 whitespace-nowrap ${activeTab === 'suppliers' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}><ShoppingCart size={14}/> Market Directory</button>
      </div>
      
      {activeTab === 'customers' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
              <div onClick={() => setIsInviteModalOpen(true)} className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center group hover:bg-emerald-50/30 hover:border-emerald-200 transition-all cursor-pointer min-h-[400px] shadow-inner-sm bg-white/50">
                  <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-xl flex items-center justify-center mb-8 border border-gray-50 transition-transform group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-emerald-100">
                    <UserPlus size={36} className="text-emerald-500"/>
                  </div>
                  <h3 className="text-2xl font-black text-gray-400 group-hover:text-gray-900 tracking-tight uppercase leading-none">Provision Buyer</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4 max-w-[180px]">Generate a direct-connect onboarding portal link</p>
              </div>

              {filteredCustomers.map(contact => {
                  const statusCfg = getStatusConfig(contact.connectionStatus);
                  const StatusIcon = statusCfg.icon;
                  const customerGmv = allOrders.filter(o => o.buyerId === contact.id).reduce((sum, o) => sum + o.totalAmount, 0);

                  return (
                    <div key={contact.id} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col justify-between min-h-[400px] animate-in zoom-in-95 duration-300">
                        <div>
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-3xl shadow-inner-sm border border-indigo-100/50">{contact.businessName.charAt(0)}</div>
                                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm ${statusCfg.color}`}>
                                    <StatusIcon size={16}/>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{contact.connectionStatus || 'Connected'}</span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter group-hover:text-indigo-600 mb-1 uppercase leading-none transition-colors">{contact.businessName}</h3>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-6">{contact.category || 'MARKETPLACE BUYER'}</p>
                            
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                    <div className="flex items-center gap-2 text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                        <TrendingUp size={10} className="text-emerald-500"/> Lifetime Volume
                                    </div>
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate">
                                        ${customerGmv.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                    <div className="flex items-center gap-2 text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                        <Clock size={10} className="text-indigo-400"/> Partnership
                                    </div>
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate">
                                        Active
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-4 text-xs text-gray-500 font-bold uppercase tracking-wide truncate"><div className="p-2 bg-gray-50 rounded-lg text-gray-300"><Mail size={16}/></div> {contact.email}</div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 font-bold uppercase tracking-wide"><div className="p-2 bg-gray-50 rounded-lg text-gray-300"><Smartphone size={16}/></div> {contact.phone || '0400 123 456'}</div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-8">
                            <button onClick={() => setSendProductTarget(contact)} className="flex-1 py-4 bg-white border-2 border-indigo-100 text-indigo-600 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest transition-all hover:bg-indigo-600 hover:text-white shadow-sm active:scale-95"><Camera size={16}/> Offer</button>
                            <button onClick={() => navigate(`/contacts?id=${contact.id}`)} className="flex-[2] py-4 bg-[#043003] text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest transition-all hover:bg-black shadow-xl active:scale-95 flex items-center justify-center gap-2"><MessageSquare size={18}/> Manage</button>
                        </div>
                    </div>
                  );
              })}
          </div>
      ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 px-2">
            
            <div className="bg-white p-2 rounded-[2rem] border border-gray-200 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar mb-8 whitespace-nowrap">
                {AU_STATES.map(state => (
                    <button
                        key={state}
                        onClick={() => setSelectedState(state)}
                        className={`flex-1 min-w-[90px] py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shrink-0 ${selectedState === state ? 'bg-[#043003] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}
                    >
                        {state}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-8 shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-md border border-gray-100 shrink-0">
                            <ShoppingCart size={28}/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">{selectedState} Market Directory</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Discover potential {selectedState} partners and wholesale buyers</p>
                        </div>
                    </div>
                    
                    <div className="bg-emerald-50 px-6 py-2.5 rounded-xl border border-emerald-100 flex items-center gap-2">
                         <Globe size={16} className="text-emerald-600 animate-spin-slow"/>
                         <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Global Network Discovery</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {filteredMarketSuppliers.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-10 py-6">Company Name</th>
                                    <th className="px-10 py-6">Specialty / Category</th>
                                    <th className="px-10 py-6">Market Location</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredMarketSuppliers.map((supplier, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="font-black text-gray-900 tracking-tight text-base uppercase leading-none">{supplier.name}</div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[9px] text-indigo-500 font-black uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{supplier.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200">
                                                {supplier.specialty}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase">
                                                <MapPin size={12} className="text-gray-300"/> {supplier.location}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => triggerNativeSms(supplier.mobile, `Hi ${supplier.name}, contacting you via Platform Zero...`)}
                                                    className="px-6 py-3 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm active:scale-95"
                                                >
                                                    Connect
                                                </button>
                                                <button 
                                                    onClick={() => setSendProductTarget({ ...supplier, phone: supplier.mobile, businessName: supplier.name })}
                                                    className="p-3 bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all shadow-sm"
                                                >
                                                    <Camera size={18}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-24 text-center">
                            <Globe size={48} className="mx-auto text-gray-100 mb-6"/>
                            <h3 className="text-xl font-black text-gray-300 uppercase tracking-tight">Accessing {selectedState} Regional Node...</h3>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Real-time data for this region is loading.</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
      )}
      {sendProductTarget && (
        <SendProductOfferModal 
          isOpen={!!sendProductTarget} 
          onClose={() => setSendProductTarget(null)} 
          targetPartner={sendProductTarget} 
          products={products}
        />
      )}
      <InviteBuyerModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} wholesaler={user} />
    </div>
  );
};

const ArrowLeft = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);