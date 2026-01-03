import React, { useState, useEffect, useRef } from 'react';
import { User, Order, InventoryItem, Product } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Sprout, Leaf, ShoppingBag, DollarSign, TrendingUp, 
  Calendar, MapPin, CheckCircle, Clock, Plus, 
  BarChart4, ArrowRight, Package, Truck, Info, Heart,
  Edit2, CloudRain, Thermometer, Droplets, SprayCan, FileText, Camera, X, Share2, Search, ChevronDown
} from 'lucide-react';
import { AiOpportunityMatcher } from './AiOpportunityMatcher';
import { InterestsModal } from './InterestsModal';

interface FarmerDashboardProps {
  user: User;
}

const HarvestLoggingModal = ({ isOpen, onClose, onSave, products }: any) => {
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        description: '',
        sprays: '',
        water: '',
        weather: 'Sunny',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Log New Harvest</h2>
                        <p className="text-sm text-gray-500 font-medium">Record field conditions and product specifics.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm border border-gray-100"><X size={24}/></button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Product</label>
                            <select 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                value={formData.productId}
                                onChange={e => setFormData({...formData, productId: e.target.value})}
                            >
                                <option value="">Select Produce...</option>
                                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Estimated Quantity (kg)</label>
                            <input 
                                type="number"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="0.00"
                                value={formData.quantity}
                                onChange={e => setFormData({...formData, quantity: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Harvest Description</label>
                        <textarea 
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                            placeholder="e.g. Field 4, row 12. Early morning pick, high sugar content."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <SprayCan size={14} className="text-orange-500"/> Sprays / Inputs Used
                            </label>
                            <input 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Organic fungicide etc."
                                value={formData.sprays}
                                onChange={e => setFormData({...formData, sprays: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <Droplets size={14} className="text-blue-500"/> Water Added (L/m2)
                            </label>
                            <input 
                                type="number"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="0"
                                value={formData.water}
                                onChange={e => setFormData({...formData, water: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Date</label>
                            <input type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Time</label>
                            <input type="time" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Weather</label>
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold" value={formData.weather} onChange={e => setFormData({...formData, weather: e.target.value})}>
                                <option>Sunny</option>
                                <option>Overcast</option>
                                <option>Rainy</option>
                                <option>Frosty</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all">
                        Cancel
                    </button>
                    <button 
                        onClick={() => onSave(formData)}
                        className="flex-[2] py-4 bg-[#043003] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18}/> List Harvest
                    </button>
                </div>
            </div>
        </div>
    );
};

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ user }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [showStatsDropdown, setShowStatsDropdown] = useState(false);
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);

  const statsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);

    // Trigger popup if interests are empty
    if ((!user.activeSellingInterests || user.activeSellingInterests.length === 0) && (!user.activeBuyingInterests || user.activeBuyingInterests.length === 0)) {
        setIsInterestsModalOpen(true);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (statsDropdownRef.current && !statsDropdownRef.current.contains(event.target as Node)) {
        setShowStatsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        clearInterval(interval);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user]);

  const loadData = () => {
    setInventory(mockService.getInventory(user.id));
    setOrders(mockService.getOrders(user.id).filter(o => o.sellerId === user.id));
    setProducts(mockService.getAllProducts());
  };

  const handleSaveHarvest = (data: any) => {
      const newItem: InventoryItem = {
          id: `inv-${Date.now()}`,
          lotNumber: mockService.generateLotId(),
          productId: data.productId,
          ownerId: user.id,
          quantityKg: parseFloat(data.quantity),
          status: 'Available',
          harvestDate: `${data.date}T${data.time}:00Z`,
          uploadedAt: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(),
          harvestLocation: `Field Update: ${data.weather}`,
          notes: JSON.stringify({
              sprays: data.sprays,
              water: data.water,
              description: data.description,
              weather: data.weather
          })
      };
      mockService.addInventoryItem(newItem);
      setIsHarvestModalOpen(false);
      loadData();
      alert("Harvest lot listed and live on the marketplace!");
  };

  const handleUpdateItem = (item: InventoryItem) => {
      const newQty = prompt(`Updating ${products.find(p => p.id === item.productId)?.name}. Enter new total quantity (kg):`, item.quantityKg.toString());
      if (newQty !== null) {
          mockService.updateInventoryStatus(item.id, item.status);
          const allInv = mockService.getAllInventory();
          const target = allInv.find(i => i.id === item.id);
          if (target) {
              target.quantityKg = parseFloat(newQty);
          }
          loadData();
      }
  };

  const pendingDeliveries = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="mb-10">
        <h1 className="text-[32px] font-black text-[#043003] tracking-tight flex items-center gap-3 leading-none">
          <Sprout size={36} className="text-[#10B981]"/> Farmer Portal
        </h1>
        <p className="text-gray-500 font-medium mt-1">Managing {user.businessName} • Harvest to Market Console</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-12">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-emerald-100 flex flex-col justify-between min-h-[240px]">
          <div>
            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Farm Revenue (Weekly)</p>
            <div className="flex justify-between items-end">
                <h3 className="text-6xl font-black text-gray-900 tracking-tighter">$4,280</h3>
                <div className="bg-emerald-50 p-4 rounded-3xl text-emerald-600"><DollarSign size={32}/></div>
            </div>
          </div>
          
          <div className="flex gap-4 mt-10">
            <button 
                onClick={() => setIsHarvestModalOpen(true)}
                className="flex-[2] py-5 bg-[#043003] hover:bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-2xl transition-all active:scale-95"
            >
                <Plus size={18}/> List New Harvest
            </button>
            <button 
                onClick={() => setIsSellModalOpen(true)}
                className="flex-1 py-5 bg-white border-2 border-[#043003] text-[#043003] rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95"
            >
                <Camera size={18}/> Sell Now
            </button>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between min-h-[240px] relative" ref={statsDropdownRef}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Operational Health</p>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Active Insights</h3>
                </div>
                <button 
                    onClick={() => setShowStatsDropdown(!showStatsDropdown)}
                    className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-white hover:shadow-md transition-all flex items-center gap-2"
                >
                    <span className="text-xs font-black uppercase tracking-widest text-gray-600">View Detail</span>
                    <ChevronDown size={20} className={`transition-transform duration-300 ${showStatsDropdown ? 'rotate-180' : ''}`}/>
                </button>
            </div>

            <div className="mt-6 flex items-center gap-4">
                <div className="bg-blue-50 p-4 rounded-3xl text-blue-600"><Leaf size={32}/></div>
                <div>
                    <p className="text-3xl font-black text-gray-900">{inventory.length} Stock Lots</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Live in Marketplace</p>
                </div>
            </div>

            {showStatsDropdown && (
                <div className="absolute top-[90%] left-0 right-0 z-50 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-gray-100 p-8 animate-in slide-in-from-top-4 duration-200 mt-4 mx-4">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-5 hover:bg-gray-50 rounded-3xl transition-colors border border-transparent hover:border-gray-100">
                            <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><Leaf size={24}/></div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Active Inventory</p>
                                <p className="text-xl font-black text-gray-900">{inventory.length} Lots Available</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-5 hover:bg-gray-50 rounded-3xl transition-colors border border-transparent hover:border-gray-100">
                            <div className="bg-orange-100 p-3 rounded-2xl text-orange-600"><Truck size={24}/></div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Logistics Status</p>
                                <p className="text-xl font-black text-gray-900">{pendingDeliveries.length} Pickups Pending</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                    <Droplets className="text-emerald-500" size={28}/> Current Field Harvest
                </h3>
                <span className="text-[10px] font-black bg-white border border-gray-200 px-5 py-2 rounded-full text-gray-400 uppercase tracking-widest shadow-sm">{inventory.length} Active Lots</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {inventory.length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-inner-sm">
                        <Plus size={64} className="mx-auto text-gray-100 mb-6"/>
                        <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">No active harvest lots. Use the button above to start.</p>
                    </div>
                ) : (
                    inventory.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        let fieldData = { sprays: 'Standard', water: 'Logged', weather: 'Mixed', description: '' };
                        try { if(item.notes) fieldData = JSON.parse(item.notes); } catch(e){}

                        return (
                            <div key={item.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all animate-in zoom-in-95">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                                            <img src={product?.imageUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-2xl tracking-tight leading-none">{product?.name}</h4>
                                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-2">{item.quantityKg}kg available</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleUpdateItem(item)} className="p-3 bg-gray-50 text-gray-400 hover:text-emerald-600 rounded-xl transition-all shadow-sm">
                                        <Edit2 size={20}/>
                                    </button>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-2"><SprayCan size={16} className="text-orange-400"/> Sprays:</span>
                                        <span className="text-gray-900">{fieldData.sprays || 'None'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-2"><Droplets size={16} className="text-blue-400"/> Irrigation:</span>
                                        <span className="text-gray-900">{fieldData.water}L/m2</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-2"><CloudRain size={16} className="text-slate-400"/> Weather:</span>
                                        <span className="text-gray-900">{fieldData.weather}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                        Harvest: {new Date(item.harvestDate).toLocaleDateString()}
                                    </p>
                                    <button 
                                        onClick={() => handleUpdateItem(item)}
                                        className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em] hover:underline"
                                    >
                                        Update Lot Details
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#0F172A] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden h-full flex flex-col min-h-[500px]">
            <div className="absolute top-0 right-0 p-12 opacity-5 transform translate-x-1/4 -translate-y-1/4 scale-150"><Sprout size={200}/></div>
            <div className="relative z-10 flex-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-10 border-b border-white/10 pb-4">Real-Time Demand</h3>
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
                  <p className="text-lg font-black text-white mb-1 uppercase tracking-tight group-hover:text-emerald-400 transition-colors">Broccoli Needed</p>
                  <p className="text-xs text-slate-400 font-medium">Melbourne Fresh • 200kg @ $3.50/kg</p>
                  <button className="mt-4 text-[10px] font-black uppercase text-emerald-400 flex items-center gap-2 group-hover:gap-3 transition-all">
                    Fulfill Now <ArrowRight size={14}/>
                  </button>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
                  <p className="text-lg font-black text-white mb-1 uppercase tracking-tight group-hover:text-emerald-400 transition-colors">Carrots Sourcing</p>
                  <p className="text-xs text-slate-400 font-medium">Sydney Bio-Gro • 500kg Imperfect</p>
                  <button className="mt-4 text-[10px] font-black uppercase text-emerald-400 flex items-center gap-2 group-hover:gap-3 transition-all">
                    Quote Batch <ArrowRight size={14}/>
                  </button>
                </div>
              </div>
            </div>
            <div className="relative z-10 pt-8 mt-10 border-t border-white/10">
              <button className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all active:scale-95">
                Browse Global Sourcing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <HarvestLoggingModal 
          isOpen={isHarvestModalOpen} 
          onClose={() => setIsHarvestModalOpen(false)}
          products={products}
          onSave={handleSaveHarvest}
      />

      {isSellModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-[3rem] w-full max-w-6xl h-[90vh] overflow-hidden relative shadow-2xl flex flex-col border border-gray-100">
                  <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase"><Camera size={36} className="text-indigo-600"/> Visual Market Capture</h2>
                    <button onClick={() => setIsSellModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm border border-gray-100 transition-all active:scale-90"><X size={32}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <AiOpportunityMatcher user={user} />
                  </div>
              </div>
          </div>
      )}

      <InterestsModal 
        user={user}
        isOpen={isInterestsModalOpen}
        onClose={() => setIsInterestsModalOpen(false)}
        onSaved={loadData}
      />
    </div>
  );
};