
import React, { useState } from 'react';
import { InventoryItem, Product } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  AlertTriangle, Clock, Leaf, Edit2, Check, X, Calendar, Truck, 
  Search, Globe, Phone, MapPin, Box, Hash, Printer, Timer
} from 'lucide-react';

interface InventoryProps {
  items: InventoryItem[];
}

export const Inventory: React.FC<InventoryProps> = ({ items }) => {
  const [activeTab, setActiveTab] = useState<'my_inventory' | 'sourcing'>('my_inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const products = mockService.getAllProducts();
  
  const getProduct = (id: string) => products.find(p => p.id === id);

  const getAgingInfo = (uploadedDate: string) => {
    const uploaded = new Date(uploadedDate);
    const diffTime = Math.abs(Date.now() - uploaded.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    let statusColor = 'text-emerald-600';
    if (diffDays >= 3) statusColor = 'text-orange-500';
    if (diffDays >= 7) statusColor = 'text-red-600';

    return { days: diffDays, hours: diffHours, color: statusColor };
  };

  const getExpiryStatus = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) return { color: 'bg-red-50 text-red-700 border-red-100', label: 'Urgent', icon: AlertTriangle, days: diffDays };
    if (diffDays <= 7) return { color: 'bg-orange-50 text-orange-700 border-orange-100', label: 'Watch', icon: Clock, days: diffDays };
    return { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Stable', icon: Leaf, days: diffDays };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Warehouse Manager</h1>
      </div>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 -mx-4 px-4 sm:mx-0 sm:px-0">
          <nav className="flex space-x-8">
              <button onClick={() => setActiveTab('my_inventory')} className={`py-4 px-2 border-b-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'my_inventory' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Active Stocklots</button>
              <button onClick={() => setActiveTab('sourcing')} className={`py-4 px-2 border-b-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'sourcing' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}><Globe size={14}/> Cross-Market Sourcing</button>
          </nav>
      </div>

      {activeTab === 'my_inventory' && (
        <div className="bg-white shadow-sm rounded-[2.5rem] overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-50">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">LOT ID / Location</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Detail</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Aging</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Freshness</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {items.map(item => {
                  const product = getProduct(item.productId);
                  const aging = getAgingInfo(item.uploadedAt);
                  const status = getExpiryStatus(item.expiryDate);
                  const StatusIcon = status.icon;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Hash size={18}/>
                            </div>
                            <div>
                                <div className="font-black text-gray-900 text-sm font-mono tracking-tighter">{item.lotNumber}</div>
                                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                    <MapPin size={10}/> {item.warehouseLocation || 'No Bin Set'}
                                </div>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                            <img className="h-full w-full object-cover" src={product?.imageUrl} alt="" />
                          </div>
                          <div>
                            <div className="font-black text-gray-900 text-sm tracking-tight">{product?.name}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{item.quantityKg}{item.unit || 'KG'} Lot</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                            <Timer size={14} className={aging.color}/>
                            <div>
                                <span className={`font-black text-sm ${aging.color}`}>
                                    {aging.days}d {aging.hours}h
                                </span>
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">In Warehouse</p>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className={`px-4 py-2 inline-flex items-center gap-2 rounded-2xl border ${status.color} font-black text-[10px] uppercase tracking-widest`}>
                          <StatusIcon size={14}/> {status.label}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button className="p-3 bg-white border border-gray-200 text-gray-400 rounded-xl hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                            <Printer size={18}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sourcing' && (
          <div className="p-20 text-center bg-white rounded-[3rem] border border-gray-100">
              <Globe size={48} className="mx-auto text-gray-200 mb-6"/>
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Accessing Australian Global Supply Network...</p>
          </div>
      )}
    </div>
  );
};
