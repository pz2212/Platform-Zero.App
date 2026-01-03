
import React, { useState, useEffect, useMemo } from 'react';
// Fix: Added missing useNavigate import
import { useNavigate } from 'react-router-dom';
import { User, UserRole, Product, InventoryItem } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Store, MapPin, Tag, MessageSquare, ChevronDown, ChevronUp, ShoppingCart, 
  X, CheckCircle, Bell, DollarSign, Truck, Send, 
  TrendingUp, Loader2, Users, Zap, Star, AlertCircle, Package, ArrowRight,
  HelpCircle, BrainCircuit, ShieldCheck, Globe, Info, Search, Filter, 
  // Fix: Added missing MessageCircle import
  Lock, ShoppingBag, Plus, Sparkles, MessageCircle
} from 'lucide-react';
import { ChatDialog } from './ChatDialog';

interface SupplierMarketProps {
  user: User;
}

export const SupplierMarket: React.FC<SupplierMarketProps> = ({ user }) => {
  // Fix: Initialized navigate using useNavigate hook
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'DIRECT' | 'DISCOVERY'>('DISCOVERY');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data State
  const [directSuppliers, setDirectSuppliers] = useState<User[]>([]);
  const [discoveryMatches, setDiscoveryMatches] = useState<{item: InventoryItem, product: Product, supplier: User}[]>([]);
  const [inventoryMap, setInventoryMap] = useState<Record<string, InventoryItem[]>>({});
  
  // UI State
  const [expandedDirectId, setExpandedDirectId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetName, setChatTargetName] = useState('');
  const [purchaseItem, setPurchaseItem] = useState<{item: InventoryItem, product: Product, supplier: User} | null>(null);
  const [purchaseQty, setPurchaseQty] = useState(1);

  const products = mockService.getAllProducts();

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const loadMarketData = () => {
    const allUsers = mockService.getAllUsers();
    const allInventory = mockService.getAllInventory();

    // 1. Direct Suppliers (Connected in network)
    // In our mock, customers have a connectedSupplierId. For wholesalers, we assume they have direct farmer partners.
    // Let's filter farmers/wholesalers who are explicitly connected or just direct partners.
    const direct = allUsers.filter(u => 
        (u.role === UserRole.FARMER || u.role === UserRole.WHOLESALER) && 
        u.id !== user.id && 
        // For demo: Bob Farmer (u3) is Sarah's (u2) direct partner
        (u.id === 'u3' || u.businessProfile?.isPzAgent) 
    );
    setDirectSuppliers(direct);

    const dInvMap: Record<string, InventoryItem[]> = {};
    direct.forEach(s => {
        dInvMap[s.id] = allInventory.filter(i => i.ownerId === s.id && i.status === 'Available');
    });
    setInventoryMap(dInvMap);

    // 2. Discovery Matches (Outside network, matched by buying interests)
    // If Sarah is interested in 'Potatoes' or 'Apples', find non-direct suppliers selling those.
    const interests = user.activeBuyingInterests || [];
    const discovery = allInventory
        .filter(i => i.status === 'Available' && i.ownerId !== user.id && !direct.some(d => d.id === i.ownerId))
        .map(i => ({
            item: i,
            product: products.find(p => p.id === i.productId)!,
            supplier: allUsers.find(u => u.id === i.ownerId)!
        }))
        .filter(entry => 
            entry.product && 
            interests.some(interest => 
                entry.product.name.toLowerCase().includes(interest.toLowerCase()) || 
                entry.product.variety.toLowerCase().includes(interest.toLowerCase())
            )
        );
    setDiscoveryMatches(discovery);
  };

  const handlePurchase = () => {
    if (!purchaseItem) return;
    
    mockService.createInstantOrder(user.id, purchaseItem.item, purchaseQty, purchaseItem.product.defaultPricePerKg);
    alert(`Success! Purchase of ${purchaseQty} units confirmed. Invoice generated.`);
    setPurchaseItem(null);
    loadMarketData();
  };

  const handleConnect = (name: string) => {
    setChatTargetName(name);
    setIsChatOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8 px-2">
        <div>
            <h1 className="text-[44px] font-black text-[#0F172A] tracking-tighter uppercase leading-none">Supplier Market</h1>
            <p className="text-gray-400 font-bold text-sm tracking-tight mt-2 flex items-center gap-3 uppercase">
                Direct Procurement & Discovery <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span> {user.businessName}
            </p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 border border-gray-200 shadow-inner-sm w-full md:w-auto">
            <button 
                onClick={() => setActiveTab('DISCOVERY')}
                className={`flex-1 md:flex-none px-10 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${activeTab === 'DISCOVERY' ? 'bg-white text-gray-900 shadow-lg ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <Sparkles size={16} className={activeTab === 'DISCOVERY' ? 'text-indigo-600' : ''}/> Intelligent Sourcing
            </button>
            <button 
                onClick={() => setActiveTab('DIRECT')}
                className={`flex-1 md:flex-none px-10 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${activeTab === 'DIRECT' ? 'bg-white text-gray-900 shadow-lg ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <LinkIcon size={16} className={activeTab === 'DIRECT' ? 'text-emerald-600' : ''}/> Partner Supply
            </button>
        </div>
      </div>

      {activeTab === 'DISCOVERY' && (
        <div className="space-y-12 animate-in slide-in-from-right-4 duration-700 px-2">
            
            {/* DISCOVERY HEADER */}
            <div className="bg-[#0B1221] rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 transform rotate-12 scale-150 group-hover:rotate-0 transition-transform duration-700"><BrainCircuit size={200} className="text-emerald-400"/></div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-500/30">
                        <Zap size={14}/> Network Discovery Engine Active
                    </div>
                    <h2 className="text-4xl font-black tracking-tight leading-none mb-4 uppercase">Direct Sourcing, Anonymized for Value.</h2>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed">
                        We've matched your <span className="text-white font-black underline underline-offset-4 decoration-emerald-500">buying interests</span> with premium producers across Australia. Platform Zero manages the quality, logistics, and settlement—saving you up to 22% vs traditional auction buy-ins.
                    </p>
                </div>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={24}/>
                    <input 
                        placeholder="Search intelligent sourcing pool..." 
                        className="w-full pl-16 pr-8 py-6 bg-white border-2 border-gray-100 rounded-[2rem] font-bold text-lg outline-none focus:border-indigo-500 shadow-sm transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-10 py-6 bg-white border-2 border-gray-100 rounded-[2rem] text-gray-400 font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 hover:border-gray-200 transition-all">
                    <Filter size={20}/> Advanced Matrix
                </button>
            </div>

            {/* DISCOVERY GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {discoveryMatches.length === 0 ? (
                    <div className="col-span-full py-40 text-center opacity-30 grayscale">
                        <ShoppingBag size={80} className="mx-auto mb-6 text-gray-300"/>
                        <p className="text-lg font-black uppercase tracking-[0.2em] text-gray-400">No active network matches for your buying interests</p>
                        <button onClick={() => navigate('/settings')} className="mt-6 text-indigo-600 font-black uppercase text-xs hover:underline">Update Sourcing Interests</button>
                    </div>
                ) : discoveryMatches.filter(m => m.product.name.toLowerCase().includes(searchTerm.toLowerCase())).map((entry, idx) => (
                    <div key={idx} className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 relative">
                        {/* PRODUCT IMAGE CONTAINER */}
                        <div className="h-64 overflow-hidden relative">
                            <img src={entry.product.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt=""/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg border border-white/20">Verified Quality</span>
                                <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">{entry.product.variety}</span>
                            </div>

                            <div className="absolute bottom-6 left-6 right-6">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1">{entry.product.name}</h3>
                                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                    <Globe size={12}/> PZ Intelligent Network Sourcing
                                </div>
                            </div>
                        </div>

                        {/* ANONYMIZED SUPPLIER / TRADE INFO */}
                        <div className="p-8 flex-1 flex flex-col justify-between">
                            <div className="space-y-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Market Origin</p>
                                        <div className="flex items-center gap-3 text-gray-900 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
                                            <Lock size={14} className="text-gray-300"/>
                                            <span className="font-black text-xs uppercase tracking-tight">Premium Regional Farmer</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Availability</p>
                                        <p className="text-xl font-black text-gray-900 tracking-tighter">{entry.item.quantityKg}{entry.product.unit || 'kg'}</p>
                                    </div>
                                </div>

                                <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 flex justify-between items-center group/price hover:bg-indigo-600 hover:border-indigo-600 transition-all duration-500">
                                    <div>
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 group-hover/price:text-indigo-200">PZ Optimized Rate</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-indigo-700 tracking-tighter group-hover/price:text-white">${entry.product.defaultPricePerKg.toFixed(2)}</span>
                                            <span className="text-[10px] font-black text-indigo-400 uppercase group-hover/price:text-indigo-300">/ {entry.product.unit || 'kg'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover/price:text-indigo-200">Logistics (Est)</p>
                                        <p className="text-lg font-black text-gray-900 tracking-tight group-hover/price:text-white">${(entry.item.logisticsPrice || 0).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex gap-3">
                                <button 
                                    onClick={() => handleConnect('Premium Network Partner')}
                                    className="flex-1 py-4 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                                >
                                    <MessageCircle size={16}/> Connect
                                </button>
                                <button 
                                    onClick={() => { setPurchaseItem(entry); setPurchaseQty(entry.item.quantityKg); }}
                                    className="flex-[2] py-4 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/10 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <ShoppingCart size={18}/> Instant Procurement
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {activeTab === 'DIRECT' && (
        <div className="space-y-12 animate-in slide-in-from-left-4 duration-700 px-2">
            
            {/* DIRECT HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 p-10 opacity-[0.02] pointer-events-none transform translate-x-1/4 translate-y-1/4 scale-150"><Users size={200}/></div>
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 shadow-inner-sm border border-emerald-100 shrink-0">
                        <Store size={40}/>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none">Supply Chain Partners</h2>
                        <p className="text-gray-400 font-bold text-sm mt-2 uppercase tracking-widest">Browsing inventory from your {directSuppliers.length} connected partners</p>
                    </div>
                </div>
                <button className="px-10 py-5 bg-[#0F172A] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] shadow-xl hover:bg-black transition-all active:scale-95 flex items-center gap-3">
                    <Plus size={18}/> Provision New Partner
                </button>
            </div>

            {/* DIRECT SUPPLIER LIST */}
            <div className="space-y-6">
                {directSuppliers.map(supplier => {
                    const items = inventoryMap[supplier.id] || [];
                    const isExpanded = expandedDirectId === supplier.id;
                    
                    return (
                        <div key={supplier.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group transition-all hover:shadow-xl hover:border-emerald-100">
                            <div 
                                onClick={() => setExpandedDirectId(isExpanded ? null : supplier.id)}
                                className="p-8 flex flex-col md:flex-row justify-between items-center gap-8 cursor-pointer hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="flex items-center gap-8">
                                    <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center font-black text-4xl shadow-inner-sm border ${supplier.role === 'FARMER' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                        {supplier.businessName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">{supplier.businessName}</h3>
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${supplier.role === 'FARMER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{supplier.role}</span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={14} className="text-gray-300"/> {supplier.businessProfile?.businessLocation || 'Adelaide Regional Market'}</span>
                                            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><Package size={14} className="text-emerald-400"/> {items.length} Products Live</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleConnect(supplier.businessName); }}
                                        className="px-8 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 font-black uppercase text-[10px] tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
                                    >
                                        <MessageSquare size={18}/> Chat
                                    </button>
                                    <div className={`p-3 rounded-xl bg-gray-100 text-gray-300 transition-transform duration-500 ${isExpanded ? 'rotate-180 bg-emerald-50 text-emerald-600 shadow-inner' : ''}`}>
                                        <ChevronDown size={28}/>
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t border-gray-50 bg-gray-50/20 p-10 animate-in slide-in-from-top-4 duration-500">
                                    {items.length === 0 ? (
                                        <div className="py-20 text-center text-gray-400 italic font-medium">No live stocklots found for this partner</div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                            {items.map(item => {
                                                const p = products.find(prod => prod.id === item.productId);
                                                return (
                                                    <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group/item flex flex-col justify-between min-h-[360px]">
                                                        <div>
                                                            <div className="h-40 rounded-2xl overflow-hidden mb-6 border border-gray-50 shadow-inner-sm">
                                                                <img src={p?.imageUrl} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" alt=""/>
                                                            </div>
                                                            <h4 className="font-black text-gray-900 uppercase text-lg leading-tight mb-1 truncate">{p?.name}</h4>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.quantityKg}{p?.unit || 'kg'} available</p>
                                                        </div>

                                                        <div className="space-y-6">
                                                            <div className="flex justify-between items-end border-t border-gray-50 pt-6">
                                                                <div>
                                                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Direct Partner Rate</p>
                                                                    <div className="flex items-baseline gap-1">
                                                                        <span className="text-2xl font-black text-emerald-600 tracking-tighter">${p?.defaultPricePerKg.toFixed(2)}</span>
                                                                        <span className="text-[10px] font-black text-gray-400 uppercase">/ kg</span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Lot ID</p>
                                                                    <p className="text-xs font-black text-gray-900 font-mono tracking-tighter uppercase">{item.lotNumber}</p>
                                                                </div>
                                                            </div>

                                                            <button 
                                                                onClick={() => { setPurchaseItem({item, product: p!, supplier}); setPurchaseQty(item.quantityKg); }}
                                                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95"
                                                            >
                                                                <ShoppingCart size={16}/> Instant Buy
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {/* PURCHASE CONFIRMATION MODAL */}
      {purchaseItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-gray-100">
                  <div className="relative h-56 bg-gray-100">
                      <img src={purchaseItem.product.imageUrl} className="w-full h-full object-cover" alt=""/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <button onClick={() => setPurchaseItem(null)} className="absolute top-6 right-6 p-2 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition-all shadow-lg active:scale-90"><X size={24}/></button>
                      <div className="absolute bottom-6 left-8">
                          <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-1">{purchaseItem.product.name}</h2>
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{purchaseItem.product.variety}</p>
                      </div>
                  </div>

                  <div className="p-10 space-y-10">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Fulfillment Pool</span>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{purchaseItem.item.quantityKg}kg Max</span>
                        </div>
                        <div className="relative group">
                            <input 
                                type="number" 
                                min="1" 
                                max={purchaseItem.item.quantityKg} 
                                value={purchaseQty} 
                                onChange={(e) => setPurchaseQty(Math.min(purchaseItem.item.quantityKg, Number(e.target.value)))} 
                                className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-3xl font-black text-4xl text-gray-900 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner-sm pr-16"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-300 text-lg">KG</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 space-y-4">
                          <div className="flex justify-between items-center text-sm font-bold text-gray-500 uppercase tracking-widest">
                              <span>Subtotal</span>
                              <span className="text-gray-900 font-black">${(purchaseQty * purchaseItem.product.defaultPricePerKg).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-bold text-gray-500 uppercase tracking-widest">
                              <span>Logistics Fee</span>
                              <span className="text-gray-900 font-black">${(purchaseItem.item.logisticsPrice || 0).toFixed(2)}</span>
                          </div>
                          <div className="h-px bg-gray-200 my-4"></div>
                          <div className="flex justify-between items-end">
                              <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Final Payable</span>
                              <span className="text-4xl font-black text-[#043003] tracking-tighter leading-none">${((purchaseQty * purchaseItem.product.defaultPricePerKg) + (purchaseItem.item.logisticsPrice || 0)).toFixed(2)}</span>
                          </div>
                      </div>

                      <button 
                        onClick={handlePurchase}
                        className="w-full py-6 bg-[#043003] text-white rounded-2xl font-black uppercase tracking-[0.25em] text-xs shadow-2xl shadow-emerald-900/10 hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-[0.98] group"
                      >
                          <ShieldCheck size={20} className="text-emerald-400"/> Confirm Trade & Dispatch <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* CHAT INTERFACE */}
      <ChatDialog 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        orderId="NETWORK-INQUIRY" 
        issueType={`Procurement Inquiry: Discovery Matrix`} 
        repName={chatTargetName} 
      />
    </div>
  );
};

const LinkIcon = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);
