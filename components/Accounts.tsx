
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Order, Product, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  ArrowDownLeft, ArrowUpRight, FileText, Download, Filter, Search, 
  DollarSign, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Clock, Package, User as UserIcon, CreditCard, Banknote, ChevronDown,
  TrendingUp, ChevronUp, Wallet, ShieldCheck, CheckCircle2, AlertTriangle,
  ArrowRight, BarChart3, PieChart, LayoutDashboard, Plus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AccountsProps {
  user: User;
}

const ConsumerAccounts: React.FC<AccountsProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'insights' | 'wallet'>('overview');
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    
    useEffect(() => {
        const fetch = () => {
            const userOrders = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
            setOrders(userOrders);
            setProducts(mockService.getAllProducts());
        };
        fetch();
        const interval = setInterval(fetch, 5000);
        return () => clearInterval(interval);
    }, [user.id]);

    const outstandingBalance = useMemo(() => 
        orders.filter(o => o.paymentStatus !== 'Paid').reduce((sum, o) => sum + o.totalAmount, 0)
    , [orders]);

    const totalLTV = useMemo(() => 
        orders.reduce((sum, o) => sum + o.totalAmount, 0)
    , [orders]);

    const chartData = [
        { name: 'Jul', spend: 3200 },
        { name: 'Aug', spend: 2800 },
        { name: 'Sep', spend: 4500 },
        { name: 'Oct', spend: 3900 },
        { name: 'Nov', spend: 4100 },
        { name: 'Dec', spend: totalLTV > 5000 ? 5200 : totalLTV },
    ];

    const categoryData = [
        { name: 'Vegetables', value: 65, color: '#10B981' },
        { name: 'Fruit', value: 25, color: '#3B82F6' },
        { name: 'Deli / Pantry', value: 10, color: '#F59E0B' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Financial Center</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage billing, credits, and spending efficiency.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-all flex items-center gap-2">
                        <Download size={16}/> Export Statement
                    </button>
                    <button className="px-8 py-3 bg-[#043003] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all">
                        Pay Balance
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0B1221] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150 pointer-events-none group-hover:scale-[1.7] transition-transform duration-700"><DollarSign size={120}/></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">Total Payables</p>
                        <h3 className="text-5xl font-black tracking-tighter mb-4">${outstandingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                        <div className="flex items-center gap-2 text-emerald-400/80 text-[10px] font-black uppercase tracking-widest">
                            <Clock size={14}/> Next Payout: 12 Jan
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Market Credit</p>
                        <h3 className="text-4xl font-black text-gray-900 tracking-tighter">$15,000<span className="text-lg text-gray-300 ml-1">/ limit</span></h3>
                    </div>
                    <div className="mt-8">
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-indigo-600" style={{width: `${(outstandingBalance / 15000) * 100}%`}}></div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
                            <span>{((outstandingBalance / 15000) * 100).toFixed(0)}% Utilized</span>
                            <span className="text-indigo-600">${(15000 - outstandingBalance).toLocaleString()} Available</span>
                        </p>
                    </div>
                </div>

                <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform -rotate-12 scale-150 pointer-events-none group-hover:rotate-0 transition-transform duration-700"><Wallet size={120}/></div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.3em] mb-4">PZ Credits</p>
                        <h3 className="text-4xl font-black tracking-tighter">$428.50</h3>
                    </div>
                    <button className="mt-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all">
                        Earn More Credits
                    </button>
                </div>
            </div>

            {/* Main Tabs Container */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
                <div className="bg-gray-50/50 border-b border-gray-100 flex overflow-x-auto no-scrollbar whitespace-nowrap">
                    {[
                        { id: 'overview', label: 'Financial Overview', icon: LayoutDashboard },
                        { id: 'invoices', label: 'Invoices & Ledger', icon: FileText },
                        { id: 'insights', label: 'Spending Insights', icon: BarChart3 },
                        { id: 'wallet', label: 'Payment Settings', icon: CreditCard },
                    ].map((t) => (
                        <button
                            key={t.id} onClick={() => setActiveTab(t.id as any)}
                            className={`flex-1 min-w-[160px] py-6 px-4 text-center font-black text-[10px] uppercase tracking-[0.2em] transition-all border-b-4 shrink-0 flex items-center justify-center gap-3 ${
                                activeTab === t.id ? 'border-emerald-600 text-[#043003] bg-white shadow-inner-sm' : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <t.icon size={16}/> {t.label}
                        </button>
                    ))}
                </div>

                <div className="p-10 flex-1">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-8">
                                <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                                    <TrendingUp className="text-emerald-600" size={24}/> Recent Spending Trend
                                </h4>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 800}} dy={10} />
                                            <YAxis hide />
                                            <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                                            <Bar dataKey="spend" radius={[8, 8, 0, 0]} barSize={40}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#10B981' : '#CBD5E1'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm"><ShieldCheck size={24}/></div>
                                    <div>
                                        <p className="text-sm font-black text-emerald-900 uppercase tracking-tight">Audit Recommendation</p>
                                        <p className="text-xs text-emerald-700 font-medium leading-relaxed mt-1">Your spending on Leafy Greens has increased 12% MoM. Consider setting up a fixed price contract with Sarah Wholesaler to stabilize margins.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                                    <PieChart className="text-indigo-600" size={24}/> Category Allocation
                                </h4>
                                <div className="space-y-4">
                                    {categoryData.map(cat => (
                                        <div key={cat.name} className="p-5 bg-gray-50 rounded-[1.75rem] border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-indigo-100 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: cat.color}}></div>
                                                <span className="font-black text-gray-900 text-sm uppercase tracking-tight">{cat.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-black text-gray-900">{cat.value}%</span>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">${(totalLTV * (cat.value/100)).toFixed(0)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-3">
                                    Download Full Tax Report <ArrowRight size={16}/>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'invoices' && (
                        <div className="animate-in fade-in duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <div className="relative w-full max-w-md">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"/>
                                    <input type="text" placeholder="Search invoice # or date..." className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner-sm"/>
                                </div>
                                <button className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all">
                                    <Filter size={20}/>
                                </button>
                            </div>

                            <div className="overflow-x-auto border border-gray-100 rounded-3xl bg-white shadow-inner-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="px-8 py-5">Date</th>
                                            <th className="px-8 py-5">Invoice ID</th>
                                            <th className="px-8 py-5">Direct Supplier</th>
                                            <th className="px-8 py-5 text-right">Amount</th>
                                            <th className="px-8 py-5">Status</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {orders.map(order => (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-8 py-6 text-sm font-bold text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                                                <td className="px-8 py-6 font-mono font-black text-xs text-indigo-600 uppercase tracking-tighter">INV-{order.id.split('-').pop()}</td>
                                                <td className="px-8 py-6 font-black text-gray-900 text-sm uppercase tracking-tight">
                                                    {mockService.getAllUsers().find(u => u.id === order.sellerId)?.businessName || 'PZ Partner'}
                                                </td>
                                                <td className="px-8 py-6 font-black text-gray-900 text-base tracking-tighter text-right">${order.totalAmount.toFixed(2)}</td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                                        order.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600 border-green-100' : 
                                                        order.paymentStatus === 'Overdue' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        'bg-orange-50 text-orange-600 border-orange-100'
                                                    }`}>
                                                        {order.paymentStatus || 'Unpaid'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-300 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                                                        <FileText size={18}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in-95">
                            <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-6 shadow-inner-sm">
                                <BarChart3 size={40}/>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Financial Intelligence</h3>
                            <p className="text-gray-400 font-medium max-w-sm mx-auto mt-2">Deep dive into cost-per-serving, waste-to-spend ratios, and seasonal procurement variations.</p>
                            <button className="mt-10 px-10 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">
                                Request Custom Audit
                            </button>
                        </div>
                    )}

                    {activeTab === 'wallet' && (
                        <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-6">
                                <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-3 border-b border-gray-100 pb-4">
                                    <CreditCard className="text-indigo-600" size={24}/> Saved Payment Methods
                                </h4>
                                
                                <div className="p-6 bg-white border-2 border-indigo-600 rounded-3xl shadow-xl shadow-indigo-100 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01]">
                                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transform rotate-12"><CreditCard size={120}/></div>
                                    <div className="relative z-10 flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-6 bg-indigo-900 rounded flex items-center justify-center text-white text-[8px] font-black">VISA</div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Method</span>
                                            </div>
                                            <p className="text-xl font-black text-gray-900 tracking-widest mb-1">•••• •••• •••• 4242</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Expires 12/26</p>
                                        </div>
                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck size={20}/></div>
                                    </div>
                                </div>

                                <button className="w-full py-5 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-black text-xs uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-3">
                                    <Plus size={20}/> Add New Card
                                </button>
                            </div>

                            <div className="space-y-6 pt-6">
                                <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-3 border-b border-gray-100 pb-4">
                                    <Banknote className="text-emerald-600" size={24}/> Settlement Cycle
                                </h4>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-200 flex justify-between items-center">
                                    <div>
                                        <p className="font-black text-gray-900 uppercase text-sm tracking-tight leading-none">Standard Marketplace Terms</p>
                                        <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest">Net 7 Days on Approved Credit</p>
                                    </div>
                                    <button className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Request Change</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const Accounts: React.FC<AccountsProps> = ({ user }) => {
  // Use specialized view for Consumer role
  if (user.role === UserRole.CONSUMER) {
    return <ConsumerAccounts user={user} />;
  }

  // --- Partner View (Farmer / Wholesaler) ---
  const [activeTab, setActiveTab] = useState<'receivables' | 'payables' | 'sales'>('receivables');
  const [receivables, setReceivables] = useState<Order[]>([]);
  const [payables, setPayables] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const rec = mockService.getOrders(user.id).filter(o => o.sellerId === user.id);
    setReceivables(rec);
    const pay = mockService.getOrders(user.id).filter(o => o.buyerId === user.id);
    setPayables(pay);
    setProducts(mockService.getAllProducts());
    setCustomers(mockService.getCustomers());
  }, [user]);

  const getCounterpartyName = (order: Order, type: 'receivables' | 'payables') => {
      if (type === 'receivables') return mockService.getCustomers().find(c => c.id === order.buyerId)?.businessName || 'Unknown Buyer';
      const seller = mockService.getAllUsers().find(u => u.id === order.sellerId);
      return seller ? seller.businessName : 'Unknown Supplier';
  };

  const getTotalAmount = (orders: Order[]) => orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const getStatusStyle = (status: string) => {
      switch (status) {
          case 'Paid': return 'bg-green-50 text-green-600 border-green-100';
          case 'Unpaid': return 'bg-amber-50 text-amber-600 border-amber-100';
          case 'Overdue': return 'bg-red-50 text-red-600 border-red-100';
          default: return 'bg-gray-50 text-gray-500 border-gray-100';
      }
  };

  const handleDownloadInvoice = (order: Order) => {
      alert(`Invoice INV-${order.id.split('-').pop()} generating...`);
  };

  const currentList = activeTab === 'receivables' ? receivables : payables;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 px-1">
        <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Ledger & Financials</h1>
            <p className="text-gray-400 text-sm font-medium">Real-time tracking of marketplace payables and receivables.</p>
        </div>
        <button 
            onClick={() => alert("Detailed report exporting...")}
            className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 hover:text-indigo-600 hover:border-indigo-100 flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
            <Download size={16}/> Export Statement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform rotate-12 group-hover:scale-110 transition-transform pointer-events-none"><TrendingUp size={90} className="text-emerald-900"/></div>
              <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shadow-inner-sm">
                          <ArrowDownLeft size={20} strokeWidth={2.5} />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Receivables</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tighter">${getTotalAmount(receivables).toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                  <div className="flex items-center gap-2 mt-3">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest">{receivables.length} Active Invoices</span>
                  </div>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform -rotate-12 group-hover:scale-110 transition-transform pointer-events-none"><DollarSign size={90} className="text-amber-900"/></div>
              <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shadow-inner-sm">
                          <ArrowUpRight size={20} strokeWidth={2.5} />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Payables</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tighter">${getTotalAmount(payables).toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                  <div className="flex items-center gap-2 mt-3">
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest">{payables.length} Bills Due</span>
                  </div>
              </div>
          </div>

          <div className="bg-[#0B1221] p-6 rounded-2xl shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 transform rotate-45 scale-125 pointer-events-none"><TrendingUp size={120} className="text-emerald-400"/></div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-white/10">
                          <TrendingUp size={20} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Sales Hub</span>
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tighter mb-1">${getTotalAmount(receivables).toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                  <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Lifetime Transactional Volume</p>
                </div>
                <button 
                  onClick={() => setActiveTab('sales')}
                  className="mt-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                  <CalendarIcon size={14}/> Go to Sales Tab
                </button>
              </div>
          </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
          <div className="border-b border-gray-100 flex overflow-x-auto no-scrollbar whitespace-nowrap bg-gray-50/30">
            {['receivables', 'payables', 'sales'].map((t: any) => (
                <button
                    key={t} onClick={() => setActiveTab(t)}
                    className={`flex-1 min-w-[120px] py-4 text-center font-black text-[10px] uppercase tracking-[0.2em] transition-all border-b-4 shrink-0 ${
                        activeTab === t ? 'border-indigo-600 text-indigo-600 bg-white shadow-inner-sm' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    {t}
                </button>
            ))}
          </div>

          <div className="p-6 md:p-10 flex-1">
            {activeTab === 'sales' ? (
              <SalesCalendar orders={receivables} products={products} customers={customers} />
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                        <input type="text" placeholder="Search reference or party..." className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50/10 focus:border-indigo-500 transition-all shadow-sm"/>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-5 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-400 hover:text-gray-900 hover:border-gray-400 flex items-center gap-2 uppercase tracking-widest shadow-sm transition-all"><Filter size={14}/> Filter Range</button>
                    </div>
                </div>

                <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-inner-sm bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 text-gray-400 text-[9px] font-black uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5">Statement Date</th>
                                <th className="px-6 py-5">Reference ID</th>
                                <th className="px-6 py-5">Trade Partner</th>
                                <th className="px-6 py-5">Volume</th>
                                <th className="px-6 py-5">Payment Status</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentList.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50/80 transition-all group">
                                    <td className="px-6 py-6 text-sm font-bold text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-6 font-mono font-black text-xs text-indigo-500 uppercase tracking-tighter">INV-{order.id.split('-').pop()}</td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-black">{getCounterpartyName(order, activeTab).charAt(0)}</div>
                                            <span className="font-black text-gray-900 text-sm tracking-tight">{getCounterpartyName(order, activeTab)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 font-black text-gray-900 text-base tracking-tighter">${order.totalAmount.toFixed(2)}</td>
                                    <td className="px-6 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(order.paymentStatus || 'Unpaid')}`}>
                                            {order.paymentStatus || 'Unpaid'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <button onClick={() => handleDownloadInvoice(order)} className="p-2.5 bg-white border border-gray-200 text-gray-300 hover:text-indigo-600 hover:border-indigo-200 hover:scale-110 rounded-xl transition-all shadow-sm">
                                            <FileText size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {currentList.length === 0 && (
                        <div className="py-24 text-center text-gray-300">
                            <Banknote size={40} className="mx-auto mb-4 opacity-10"/>
                            <p className="font-black uppercase tracking-[0.2em] text-[10px]">No records found for this period</p>
                        </div>
                    )}
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

const SalesCalendar = ({ orders, products, customers }: { orders: Order[], products: Product[], customers: Customer[] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const salesByDate = useMemo(() => {
    const map: Record<string, Order[]> = {};
    orders.forEach(order => {
      const dateKey = new Date(order.date).toDateString();
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(order);
    });
    return map;
  }, [orders]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);
    const calendar = [];

    for (let i = 0; i < startOffset; i++) calendar.push(null);
    for (let i = 1; i <= days; i++) {
      const date = new Date(year, month, i);
      calendar.push(date);
    }
    return calendar;
  }, [currentDate]);

  const selectedDaySales = salesByDate[selectedDate.toDateString()] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-fit">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{monthYear}</h3>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-all border border-gray-100"><ChevronLeft size={20}/></button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-all border border-gray-100"><ChevronRight size={20}/></button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="h-12" />;
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const hasSales = salesByDate[date.toDateString()];
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <button 
                key={idx}
                onClick={() => { setSelectedDate(date); setExpandedOrderId(null); }}
                className={`h-12 relative flex flex-col items-center justify-center rounded-xl transition-all group ${
                  isSelected ? 'bg-indigo-600 text-white shadow-xl scale-110 z-10' : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span className={`text-sm font-black ${isToday && !isSelected ? 'text-indigo-600 underline decoration-2' : ''}`}>{date.getDate()}</span>
                {hasSales && (
                  <div className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-400 animate-pulse'}`}></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-end px-2">
           <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Sales Ledger</h3>
              <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">{selectedDate.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
           </div>
           <div className="bg-emerald-50 px-5 py-2 rounded-[1.25rem] border border-emerald-100 flex items-center gap-3">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Day Total</span>
              <span className="font-black text-emerald-700 text-xl">${selectedDaySales.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}</span>
           </div>
        </div>

        <div className="space-y-4">
          {selectedDaySales.length === 0 ? (
            <div className="py-20 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
               <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm text-gray-300"><CalendarIcon size={32}/></div>
               <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">No active trade logged</p>
            </div>
          ) : selectedDaySales.map(sale => {
            const customer = customers.find(c => c.id === sale.buyerId);
            const timeStr = new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const isExpanded = expandedOrderId === sale.id;
            
            return (
              <div key={sale.id} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                <div 
                  onClick={() => setExpandedOrderId(isExpanded ? null : sale.id)}
                  className="p-6 cursor-pointer flex items-center gap-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-xl shadow-inner-sm">
                    {customer?.businessName.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-gray-900 text-lg truncate group-hover:text-indigo-600 transition-colors tracking-tight">{customer?.businessName || 'Wholesale Client'}</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-1"><Clock size={12}/> {timeStr}</p>
                  </div>
                  <div className="text-right mr-6 text-sm sm:text-base">
                    <p className="font-black text-gray-900 text-2xl tracking-tighter">${sale.totalAmount.toFixed(2)}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${sale.paymentMethod === 'invoice' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                       {sale.paymentMethod === 'invoice' ? 'On Terms' : 'Paid Now'}
                    </span>
                  </div>
                  <div className={`p-2 rounded-full bg-gray-50 text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-600 bg-indigo-50' : ''}`}>
                    <ChevronDown size={20}/>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="bg-gray-50/50 rounded-[1.5rem] border border-gray-100 overflow-hidden text-sm">
                      <table className="w-full text-left">
                        <thead className="bg-gray-100/50 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3">Trade Item</th>
                            <th className="px-6 py-3 text-center">Volume</th>
                            <th className="px-6 py-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {sale.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-4 font-black text-gray-700">{products.find(p => p.id === item.productId)?.name}</td>
                              <td className="px-6 py-4 text-center font-bold text-gray-500">{item.quantityKg}kg</td>
                              <td className="px-6 py-4 text-right font-black text-gray-900">${(item.quantityKg * item.pricePerKg).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
