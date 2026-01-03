
import React, { useState, useEffect, useRef } from 'react';
import { Customer, UserRole, User, RegistrationRequest, Order, Product } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Search, MoreVertical, Users, CheckCircle, Clock, ShoppingCart, 
  Eye, Edit, Settings, UserPlus, FileText, 
  ChevronDown, Store, X, Building, MapPin, Truck, Phone, Mail, Plus, Rocket
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
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Consumer Onboarding</h1>
            <p className="text-gray-500 font-medium">Manage marketplace customers and lead fulfillment</p>
        </div>
        <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-sm flex items-center gap-2 transition-all">
                <Plus size={16}/> Quick Add Supplier
            </button>
            <button className="px-5 py-2.5 bg-[#043003] hover:bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-sm flex items-center gap-2 transition-all">
                <UserPlus size={16}/> New Lead
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
            { label: 'Total Customers', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Connected', value: stats.connected, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pending Approval', value: pendingRequests.length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Active Orders', value: stats.activeOrders, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-full flex items-center justify-center`}><kpi.icon size={24} /></div>
                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</p><h3 className="text-2xl font-black text-gray-900">{kpi.value}</h3></div>
            </div>
        ))}
      </div>

      <div className="bg-gray-100/50 p-1 rounded-lg inline-flex border border-gray-200">
        <button onClick={() => setActiveTab('customers')} className={`px-8 py-2.5 text-xs font-black uppercase tracking-widest rounded-md transition-all ${activeTab === 'customers' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Current Customers</button>
        <button onClick={() => setActiveTab('orders')} className={`px-8 py-2.5 text-xs font-black uppercase tracking-widest rounded-md transition-all ${activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Orders</button>
        <button onClick={() => setActiveTab('waiting')} className={`px-8 py-2.5 text-xs font-black uppercase tracking-widest rounded-md transition-all flex items-center gap-2 ${activeTab === 'waiting' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Waiting {pendingRequests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingRequests.length}</span>}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
        {activeTab === 'customers' && (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Segment</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Connection</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredCustomers.map(customer => (
                            <tr key={customer.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="font-bold text-gray-900">{customer.businessName}</div>
                                    <div className="text-xs text-gray-400">{customer.email}</div>
                                </td>
                                <td className="px-8 py-6"><span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200">{customer.category}</span></td>
                                <td className="px-8 py-6">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${customer.connectionStatus === 'Active' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                        {customer.connectionStatus}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right relative">
                                    <button onClick={(e) => toggleActionMenu(e, customer.id)} className="p-2 text-gray-400 hover:text-gray-900 ml-auto block"><MoreVertical size={18}/></button>
                                    {activeActionMenu === customer.id && (
                                        <div ref={menuRef} className="absolute right-8 top-12 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 py-1 overflow-hidden">
                                            <button className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-gray-50">View Details</button>
                                            <button className="w-full text-left px-4 py-3 text-xs font-bold text-indigo-600 hover:bg-indigo-50">Edit Profile</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'waiting' && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map(req => (
                    <div key={req.id} className="p-6 bg-gray-50 border border-gray-200 rounded-2xl hover:border-emerald-200 transition-all flex flex-col justify-between h-full">
                        <div className="mb-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-black text-gray-900 text-lg uppercase leading-tight">{req.businessName}</h3>
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[8px] font-black uppercase">{req.requestedRole}</span>
                            </div>
                            <div className="space-y-1.5 text-xs text-gray-500 font-medium">
                                <p className="flex items-center gap-2"><Mail size={14}/> {req.email}</p>
                                <p className="flex items-center gap-2"><MapPin size={14}/> {req.consumerData?.location || 'Australia'}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleApproveRequest(req.id)} className="flex-1 py-3 bg-[#043003] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-black transition-all">Approve</button>
                            <button className="px-4 py-3 bg-white border border-gray-200 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"><X size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
