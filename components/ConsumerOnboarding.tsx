
import React, { useState, useEffect, useRef } from 'react';
import { Customer, UserRole, User, RegistrationRequest, Order, Product } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Search, MoreVertical, Users, CheckCircle, Clock, ShoppingCart, 
  Eye, Edit, Settings, UserPlus, FileText, 
  ChevronDown, Store, X, Building, MapPin, Truck, Phone, Mail, Plus, Rocket,
  ArrowRight, FilePlus,
  // Added missing Info and Smartphone icons
  Info, Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ConsumerOnboarding: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RegistrationRequest[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    connected: 0,
    pending: 0,
    activeOrders: 0
  });
  const [activeTab, setActiveTab] = useState<'customers' | 'orders' | 'waiting'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    refreshData();
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    const interval = setInterval(refreshData, 3000);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        clearInterval(interval);
    };
  }, []);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const refreshData = () => {
    const allCustomers = mockService.getCustomers();
    const requests = mockService.getRegistrationRequests().filter(r => r.status === 'Pending');
    setCustomers(allCustomers);
    setPendingRequests(requests);

    const allOrders = mockService.getOrders('u1');
    const activeOrdersCount = allOrders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status)).length;

    setStats({
      total: allCustomers.length,
      connected: allCustomers.filter(c => c.connectionStatus === 'Active').length,
      pending: requests.length,
      activeOrders: activeOrdersCount
    });
  };

  const handleApproveRequest = (id: string) => {
    mockService.approveRegistration(id);
    refreshData();
  };

  const toggleActionMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveActionMenu(activeActionMenu === id ? null : id);
  };

  const filteredCustomers = customers.filter(c => 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none">Marketplace Management</h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-2">Manage marketplace customers and lead fulfillment</p>
        </div>
        <div className="flex gap-3">
            <button className="px-8 py-3 bg-white border border-gray-200 text-gray-900 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-all">
                <FilePlus size={16}/> Manual Order
            </button>
            <button className="px-8 py-3 bg-[#043003] hover:bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl flex items-center gap-2 transition-all">
                <UserPlus size={16}/> Direct Provision
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
        {[
            { label: 'Network Total', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Trading', value: stats.connected, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Waiting (Pending Docs)', value: pendingRequests.length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Open Logistics', value: stats.activeOrders, icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-40 group hover:shadow-xl transition-all">
                <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</p>
                    <div className={`p-2 ${kpi.bg} ${kpi.color} rounded-xl group-hover:scale-110 transition-transform`}><kpi.icon size={20} /></div>
                </div>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{kpi.value}</h3>
            </div>
        ))}
      </div>

      <div className="bg-gray-100/50 p-2 rounded-[2rem] inline-flex border border-gray-200 shadow-inner-sm mx-2">
        <button onClick={() => setActiveTab('customers')} className={`px-10 py-3.5 text-xs font-black uppercase tracking-widest rounded-[1.5rem] transition-all flex items-center gap-2 ${activeTab === 'customers' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-700'}`}>
            <Store size={18}/> Active Partners
        </button>
        <button onClick={() => setActiveTab('waiting')} className={`px-10 py-3.5 text-xs font-black uppercase tracking-widest rounded-[1.5rem] transition-all flex items-center gap-2 ${activeTab === 'waiting' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-700'}`}>
            <Clock size={18}/> Waiting Queue {pendingRequests.length > 0 && <span className="bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] animate-pulse">{pendingRequests.length}</span>}
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-200 shadow-sm overflow-hidden min-h-[600px] mx-2">
        {activeTab === 'customers' && (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        <tr>
                            <th className="px-10 py-8">Business Identity</th>
                            <th className="px-10 py-8">Segment</th>
                            <th className="px-10 py-8">Trading Status</th>
                            <th className="px-10 py-8 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredCustomers.map(customer => (
                            <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-700 font-black text-xl shadow-inner-sm border border-indigo-100/50 group-hover:scale-105 transition-transform">
                                            {customer.businessName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-900 text-base uppercase tracking-tight">{customer.businessName}</div>
                                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{customer.email || 'SYSTEM_GEN'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-400 border border-gray-200">
                                        {customer.category}
                                    </span>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${customer.connectionStatus === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)] animate-pulse'}`}></div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${customer.connectionStatus === 'Active' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                            {customer.connectionStatus}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-right relative">
                                    <button onClick={(e) => toggleActionMenu(e, customer.id)} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 hover:shadow-md transition-all ml-auto block"><MoreVertical size={20}/></button>
                                    {activeActionMenu === customer.id && (
                                        <div ref={dropdownRef} className="absolute right-10 top-20 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 py-2 animate-in zoom-in-95 duration-200 overflow-hidden">
                                            <button className="w-full text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50 flex items-center gap-4 transition-colors group/item">
                                                <Eye size={18} className="text-gray-300 group-hover/item:text-indigo-600"/>
                                                View Account
                                            </button>
                                            <button className="w-full text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 flex items-center gap-4 transition-colors group/item">
                                                <Edit size={18} className="text-indigo-400 group-hover/item:text-indigo-600"/>
                                                Update Profile
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredCustomers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-10 py-32 text-center text-gray-300">
                                    <Search size={48} className="mx-auto mb-4 opacity-10"/>
                                    <p className="font-black uppercase tracking-widest text-xs">No matching active partners</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'waiting' && (
            <div className="p-10">
                <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 mb-10 flex items-start gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150 group-hover:scale-100 transition-transform duration-700"><Clock size={120}/></div>
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-indigo-50 text-indigo-600 shrink-0">
                        <Info size={32} strokeWidth={2.5} />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-lg font-black text-indigo-900 uppercase tracking-tight leading-none mb-2">Awaiting Onboarding Docs</h4>
                        <p className="text-sm text-indigo-700 font-medium leading-relaxed max-w-3xl">These businesses have been provisioned or have signed up but have <span className="font-black">NOT completed their legal trade documents</span>. Trading is disabled for these profiles until documents are finalized.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pendingRequests.map(req => (
                        <div key={req.id} className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 hover:border-orange-200 hover:shadow-xl transition-all flex flex-col justify-between h-full group animate-in zoom-in-95 duration-300">
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 font-black text-xl shadow-inner-sm group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                        {req.businessName.charAt(0)}
                                    </div>
                                    <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-orange-100 shadow-sm animate-pulse">Pending Docs</span>
                                </div>
                                <h3 className="font-black text-gray-900 text-2xl uppercase tracking-tighter leading-none mb-3 group-hover:text-indigo-600 transition-colors">{req.businessName}</h3>
                                <div className="flex items-center gap-3 mb-8">
                                    <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-indigo-100">{req.requestedRole}</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5"><Clock size={12}/> Added {new Date(req.submittedDate).toLocaleDateString()}</span>
                                </div>
                                <div className="space-y-3 bg-gray-50 p-5 rounded-3xl border border-gray-100 group-hover:bg-white group-hover:border-indigo-50 transition-all">
                                    <p className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase truncate"><Mail size={16} className="text-gray-300"/> {req.email}</p>
                                    <p className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase"><Smartphone size={16} className="text-gray-300"/> {req.consumerData?.mobile || 'MOBILE_UNSET'}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-10 pt-8 border-t border-gray-50">
                                <button className="flex-1 py-4 bg-[#131926] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 group/btn">
                                    Resend Code <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform"/>
                                </button>
                                <button onClick={() => handleApproveRequest(req.id)} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><CheckCircle size={20}/></button>
                            </div>
                        </div>
                    ))}
                    {pendingRequests.length === 0 && (
                        <div className="col-span-full py-40 text-center opacity-30 grayscale">
                            <Clock size={64} className="mx-auto mb-6 text-gray-300"/>
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Waiting queue is empty</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
