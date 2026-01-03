import React, { useState, useEffect } from 'react';
import { User, Order, Product } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  DollarSign, ShoppingBag, Truck, MapPin, 
  CheckCircle, Clock, Package, Leaf, ArrowRight,
  Sparkles, ShoppingCart, TrendingUp, History, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GrocerDashboardProps {
  user: User;
}

export const GrocerDashboard: React.FC<GrocerDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);

  useEffect(() => {
    const fetch = () => {
        const userOrders = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
        setOrders(userOrders);
        
        // Count items that have been unsold for X days (Backend logic remains, UI hides age)
        const now = new Date();
        const agedStock = mockService.getAllInventory().filter(item => {
            const uploadedAt = new Date(item.uploadedAt);
            const diffDays = (now.getTime() - uploadedAt.getTime()) / (1000 * 60 * 60 * 24);
            return diffDays >= (item.discountAfterDays || 3);
        });
        setInventoryCount(agedStock.length);
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  const activeOrders = orders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped', 'Delivered'].includes(o.status));

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase leading-none">Wholesale Hub</h1>
          <p className="text-gray-500 font-medium mt-2">Managing {user.businessName} • Direct Sourcing Console</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
           <Sparkles className="animate-pulse" size={20}/>
           <span className="text-xs font-black uppercase tracking-widest">{inventoryCount} Market Lots Available</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl transition-all">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Total Procurement Savings</p>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">$4,280</h3>
            </div>
            <div className="mt-8 flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                <TrendingUp size={14}/> +18% Efficiency
            </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl transition-all">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Active Deliveries</p>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{activeOrders.length}</h3>
            </div>
            <div className="mt-8 flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                <Truck size={14}/> 1 In-Transit
            </div>
        </div>

        <div className="bg-[#043003] p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-700"><ShoppingCart size={120}/></div>
            <div className="relative z-10">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">Market Access</p>
                <h3 className="text-2xl font-black tracking-tight leading-none mb-2">Wholesale Inventory</h3>
                <p className="text-emerald-400/80 text-xs font-medium">Direct sourcing, optimized margins.</p>
            </div>
            <button 
                onClick={() => navigate('/grocer/marketplace')}
                className="mt-8 w-full py-4 bg-white text-[#043003] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all shadow-xl shadow-black/20"
            >
                Enter Wholesale Market <ChevronRight size={16}/>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
          <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                  <History size={24} className="text-gray-400"/> Recent Procurement Activity
              </h2>
              <button onClick={() => navigate('/orders')} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">View Full Ledger</button>
          </div>
          <div className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                  <div className="py-24 text-center text-gray-400">
                      <p className="text-sm font-bold uppercase tracking-widest">No previous orders found</p>
                  </div>
              ) : orders.slice(0, 5).map(order => (
                  <div key={order.id} className="p-8 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-all">
                              <Package size={24}/>
                          </div>
                          <div>
                              <p className="font-black text-gray-900 text-lg uppercase tracking-tight">Order #{order.id.split('-').pop()}</p>
                              <div className="flex items-center gap-4 mt-1.5">
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(order.date).toLocaleDateString()}</span>
                                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">${order.totalAmount.toFixed(2)}</span>
                              </div>
                          </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${
                          order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      }`}>
                          {order.status}
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};