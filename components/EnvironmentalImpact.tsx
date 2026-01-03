
import React, { useMemo, useState } from 'react';
import { mockService } from '../services/mockDataService';
import { Leaf, Recycle, Wind, TrendingDown, BarChart3, Globe, ShieldCheck, TreePine, Droplets, Search, Filter, ArrowUpRight, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const EnvironmentalImpact: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const orders = mockService.getOrders('u1');
  const products = mockService.getAllProducts();

  const impactStats = useMemo(() => {
    let totalWaste = 0;
    let totalCo2 = 0;
    let totalWater = 0; // Estimated 50L per kg for fresh produce lifecycle diversion
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const p = products.find(prod => prod.id === item.productId);
        totalWaste += item.quantityKg;
        totalCo2 += item.quantityKg * (p?.co2SavingsPerKg || 0.8);
        totalWater += item.quantityKg * 50; 
      });
    });
    return { 
        totalWaste, 
        totalCo2, 
        totalWater,
        treesEquivalent: Math.floor(totalCo2 / 20) 
    };
  }, [orders, products]);

  const productImpactData = useMemo(() => {
    const map: Record<string, { name: string, qty: number, co2: number, water: number, image: string }> = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            const p = products.find(prod => prod.id === item.productId);
            if (!p) return;
            
            if (!map[p.id]) {
                map[p.id] = { 
                    name: p.name, 
                    qty: 0, 
                    co2: 0, 
                    water: 0,
                    image: p.imageUrl
                };
            }
            map[p.id].qty += item.quantityKg;
            map[p.id].co2 += item.quantityKg * (p.co2SavingsPerKg || 0.8);
            map[p.id].water += item.quantityKg * 50;
        });
    });

    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [orders, products]);

  const filteredProductImpact = productImpactData.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const monthlyData = [
    { name: 'Jan', co2: 450, waste: 380 },
    { name: 'Feb', co2: 520, waste: 410 },
    { name: 'Mar', co2: 610, waste: 490 },
    { name: 'Apr', co2: 580, waste: 460 },
    { name: 'May', co2: 750, waste: 620 },
    { name: 'Jun', co2: impactStats.totalCo2 / 2, waste: impactStats.totalWaste / 2 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Ecological Ledger</h1>
          <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-widest">Verified Impact & Waste Diversion Metrics</p>
        </div>
        <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
          <Globe size={20} className="animate-spin-slow" />
          <span className="text-xs font-black uppercase tracking-widest">Global Sustainability Live</span>
        </div>
      </div>

      {/* KPI HERO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#043003] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150 group-hover:scale-[1.8] transition-transform duration-700">
            <Wind size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">CO2 Avoided</p>
            <h3 className="text-5xl font-black tracking-tighter mb-1">{impactStats.totalCo2.toFixed(1)}<span className="text-xl ml-1 text-emerald-400">kg</span></h3>
            <p className="text-emerald-400/60 text-[9px] font-bold uppercase tracking-widest">Calculated via supply bypass</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Landfill Diversion</p>
            <h3 className="text-5xl font-black text-gray-900 tracking-tighter">{impactStats.totalWaste.toLocaleString()}<span className="text-xl ml-1 text-gray-300">kg</span></h3>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner-sm border border-blue-100 group-hover:scale-110 transition-transform">
              <Recycle size={20} />
            </div>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-tight">Diverted from waste stream</p>
          </div>
        </div>

        <div className="bg-indigo-50 p-8 rounded-[3rem] border border-indigo-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Freshwater Saved</p>
            <h3 className="text-5xl font-black text-indigo-700 tracking-tighter">{impactStats.totalWater.toLocaleString()}<span className="text-xl ml-1 text-indigo-300">L</span></h3>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm border border-indigo-100 group-hover:rotate-12 transition-transform">
              <Droplets size={20} />
            </div>
            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest leading-tight">Preserved during production</p>
          </div>
        </div>

        <div className="bg-emerald-50 p-8 rounded-[3rem] border border-emerald-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4">Tree Equivalent</p>
            <h3 className="text-5xl font-black text-emerald-700 tracking-tighter">{impactStats.treesEquivalent}<span className="text-xl ml-1 text-emerald-400">Trees</span></h3>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100 group-hover:animate-bounce">
              <TreePine size={20} />
            </div>
            <p className="text-[9px] text-emerald-600/60 font-black uppercase tracking-widest leading-tight">10 year maturation value</p>
          </div>
        </div>
      </div>

      {/* TREND & EFFICIENCY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3 mb-10">
            <BarChart3 className="text-indigo-600" size={24}/> Historical Savings Trend
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 800}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="co2" radius={[8, 8, 0, 0]} barSize={40} fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#131926] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-black text-emerald-400 uppercase tracking-tight mb-8">Supply Chain Efficiency</h3>
            <div className="space-y-8">
              {[
                { label: 'Transport Miles Reduced', value: '4,250', unit: 'km', color: 'bg-emerald-500' },
                { label: 'Market Dwell Time Improvement', value: '32', unit: '%', color: 'bg-blue-500' },
                { label: 'Producer Margin Preservation', value: '18', unit: '%', color: 'bg-indigo-500' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    <span className="text-2xl font-black">{stat.value}{stat.unit}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${stat.color} rounded-full transition-all duration-1000`} style={{width: '75%'}}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 pt-8 border-t border-white/5 flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <ShieldCheck size={24} className="text-emerald-400"/>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Impact calculations are based on <span className="text-white font-black">LCA Standards ISO 14040</span> using regional B2B logistics data from the SA Produce Market Hub.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED PRODUCT AUDIT TABLE */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 bg-gray-50/20">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-gray-100">
                    <BarChart3 size={32}/>
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Product Impact Audit</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Itemized Savings breakdown</p>
                </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search product audit..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-emerald-50 outline-none transition-all shadow-sm" 
                    />
                </div>
                <button className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-emerald-600 shadow-sm transition-all"><Filter size={20}/></button>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] border-b border-gray-100">
                    <tr>
                        <th className="px-10 py-6">Produce Identity</th>
                        <th className="px-10 py-6 text-right">Volume (KG)</th>
                        <th className="px-10 py-6 text-right text-emerald-600">CO2 Avoided</th>
                        <th className="px-10 py-6 text-right text-indigo-600">Water Saved</th>
                        <th className="px-10 py-6 text-right text-blue-600">Waste Diverted</th>
                        <th className="px-10 py-6 text-right">Audit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredProductImpact.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                            <td className="px-10 py-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                                        <img src={p.image} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900 uppercase text-sm tracking-tight">{p.name}</div>
                                        <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">Market Verified</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-10 py-6 text-right font-black text-gray-900 text-lg tracking-tighter">{p.qty.toLocaleString()}kg</td>
                            <td className="px-10 py-6 text-right">
                                <div className="flex flex-col items-end">
                                    <span className="font-black text-emerald-600 text-lg tracking-tighter">-{p.co2.toFixed(1)}kg</span>
                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">CO2 Equivalent</span>
                                </div>
                            </td>
                            <td className="px-10 py-6 text-right">
                                <div className="flex flex-col items-end">
                                    <span className="font-black text-indigo-600 text-lg tracking-tighter">{p.water.toLocaleString()}L</span>
                                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Freshwater</span>
                                </div>
                            </td>
                            <td className="px-10 py-6 text-right">
                                <div className="flex flex-col items-end">
                                    <span className="font-black text-blue-600 text-lg tracking-tighter">{p.qty.toLocaleString()}kg</span>
                                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">100% Diverted</span>
                                </div>
                            </td>
                            <td className="px-10 py-6 text-right">
                                <button className="p-3 bg-gray-50 rounded-xl text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90">
                                    <ArrowUpRight size={18}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredProductImpact.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-10 py-32 text-center text-gray-300">
                                <Package size={48} className="mx-auto mb-4 opacity-10"/>
                                <p className="font-black uppercase tracking-widest text-xs">No impact data found for current filters</p>
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot className="bg-gray-900 text-white font-black uppercase text-[10px] tracking-widest">
                    <tr>
                        <td className="px-10 py-6">Aggregate Totals</td>
                        <td className="px-10 py-6 text-right">{impactStats.totalWaste.toLocaleString()}kg</td>
                        <td className="px-10 py-6 text-right text-emerald-400">-{impactStats.totalCo2.toFixed(1)}kg</td>
                        <td className="px-10 py-6 text-right text-indigo-400">{impactStats.totalWater.toLocaleString()}L</td>
                        <td className="px-10 py-6 text-right text-blue-400">{impactStats.totalWaste.toLocaleString()}kg</td>
                        <td className="px-10 py-6"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
      </div>
    </div>
  );
};

const CheckCircle2 = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);
