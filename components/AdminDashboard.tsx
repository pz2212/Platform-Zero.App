
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { InventoryItem, User, UserRole, Order, Customer, Product } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  LayoutDashboard, ShoppingCart, DollarSign, Box, Users, 
  ArrowRight, Store, Search, MoreVertical, CheckCircle, TrendingUp,
  Leaf, Activity, Globe, Zap, Clock, Package, ChevronRight, X,
  Eye, Pencil, Percent, Settings, UserPlus, FileText, ChevronDown,
  UserCheck, AlertTriangle, Wallet, BarChart3, TrendingDown, Info, Loader2,
  Filter, ArrowLeft, Receipt, ChevronUp, History, ClipboardList, Truck,
  MapPin, Calendar, CheckCircle2, Timer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type DrillDownType = 'ORDERS' | 'WHOLESALERS' | 'REVENUE' | 'LEDGER' | null;

const CustomerOpsModal = ({ isOpen, onClose, customer, allOrders, products, allUsers }: { 
    isOpen: boolean, 
    onClose: () => void, 
    customer: Customer | null, 
    allOrders: Order[], 
    products: Product[],
    allUsers: User[]
}) => {
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    if (!isOpen || !customer) return null;

    const customerOrders = allOrders.filter(o => o.buyerId === customer.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const supplier = allUsers.find(u => u.id === customer.connectedSupplierId);

    const getStatusSteps = (order: Order) => {
        return [
            { label: 'Logged', time: order.date, icon: ClipboardList, color: 'text-indigo-500' },
            { label: 'Accepted', time: order.confirmedAt, icon: UserCheck, color: 'text-blue-500' },
            { label: 'Packed', time: order.packedAt, icon: Package, color: 'text-purple-500' },
            { label: 'Shipped', time: order.shippedAt, icon: Truck, color: 'text-sky-500' },
            { label: 'Delivered', time: order.deliveredAt, icon: CheckCircle2, color: 'text-emerald-500' }
        ];
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 border-4 border-white/20">
                {/* Header */}
                <div className="p-8 md:p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-indigo-600 rounded-[1.75rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-100">
                            {customer.businessName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">{customer.businessName}</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                <MapPin size={12}/> {customer.location || 'Market Location'} • <Store size={12}/> Supplier: {supplier?.businessName || 'Platform Zero Network'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white hover:bg-gray-100 rounded-full border border-gray-100 shadow-sm transition-all text-gray-300 hover:text-gray-900">
                        <X size={28} strokeWidth={2.5}/>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar space-y-10 bg-white">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50/80 p-5 rounded-3xl border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Lifetime Trade</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tighter">${customerOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50/80 p-5 rounded-3xl border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Logistics</p>
                            <p className="text-2xl font-black text-indigo-600 tracking-tighter">{customerOrders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length} Run(s)</p>
                        </div>
                        <div className="bg-gray-50/80 p-5 rounded-3xl border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Profit Generation</p>
                            <p className="text-2xl font-black text-emerald-600 tracking-tighter">${(customerOrders.reduce((sum, o) => sum + o.totalAmount, 0) * ((customer.pzMarkup || 15)/100)).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50/80 p-5 rounded-3xl border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Markup Tier</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tighter">{customer.pzMarkup || 15}%</p>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                            <History size={18} className="text-indigo-500"/> Order Fulfillment Timeline
                        </h3>

                        {customerOrders.length === 0 ? (
                            <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                                <Package size={48} className="mx-auto text-gray-200 mb-4"/>
                                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No orders found for this entity</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {customerOrders.map(order => {
                                    const isExpanded = expandedOrderId === order.id;
                                    const steps = getStatusSteps(order);
                                    const currentSupplier = allUsers.find(u => u.id === order.sellerId);

                                    return (
                                        <div key={order.id} className={`bg-white rounded-[2rem] border transition-all overflow-hidden ${isExpanded ? 'border-indigo-600 shadow-xl' : 'border-gray-100 hover:border-indigo-200 shadow-sm'}`}>
                                            <div 
                                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                                className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-6 flex-1">
                                                    <div className={`p-4 rounded-2xl shadow-inner-sm border ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                                        <ShoppingCart size={24}/>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-gray-900 text-lg tracking-tight uppercase leading-none mb-1.5">INV-{order.id.split('-').pop()}</h4>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Logged: {new Date(order.date).toLocaleDateString()} @ {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-10">
                                                    <div className="text-right hidden lg:block">
                                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Assigned Partner</p>
                                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight truncate max-w-[120px]">{currentSupplier?.businessName}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Status</p>
                                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border tracking-widest shadow-sm ${
                                                            order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            order.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                            'bg-orange-50 text-orange-700 border-orange-100'
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-right w-24">
                                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Amount</p>
                                                        <p className="text-xl font-black text-gray-900 tracking-tighter">${order.totalAmount.toFixed(2)}</p>
                                                    </div>
                                                    <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-300'}`}>
                                                        <ChevronDown size={20}/>
                                                    </div>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="bg-gray-50/50 border-t border-gray-100 p-8 space-y-10 animate-in slide-in-from-top-4 duration-300">
                                                    {/* Timeline */}
                                                    <div className="space-y-6">
                                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                            <Timer size={14}/> FULFILLMENT AUDIT TRAIL
                                                        </h5>
                                                        <div className="flex justify-between items-start relative px-4">
                                                            <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-200 z-0"></div>
                                                            {steps.map((step, idx) => {
                                                                const Icon = step.icon;
                                                                const isComplete = !!step.time;
                                                                return (
                                                                    <div key={idx} className="flex flex-col items-center flex-1 relative z-10">
                                                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 ${
                                                                            isComplete ? 'bg-emerald-600 border-white text-white shadow-xl shadow-emerald-100' : 'bg-white border-gray-100 text-gray-200 shadow-sm'
                                                                        }`}>
                                                                            <Icon size={18} strokeWidth={isComplete ? 3 : 2}/>
                                                                        </div>
                                                                        <span className={`text-[9px] font-black uppercase tracking-widest mt-3 ${isComplete ? 'text-gray-900' : 'text-gray-300'}`}>{step.label}</span>
                                                                        {isComplete && (
                                                                            <p className="text-[8px] font-bold text-gray-400 mt-1">{new Date(step.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Items Table */}
                                                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-inner-sm">
                                                        <table className="w-full text-left">
                                                            <thead className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                                                <tr>
                                                                    <th className="px-6 py-4">Market Variety</th>
                                                                    <th className="px-6 py-4 text-center">Volume</th>
                                                                    <th className="px-6 py-4 text-right">Wholesale Rate</th>
                                                                    <th className="px-6 py-4 text-right">Subtotal</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-50">
                                                                {order.items.map((item, iIdx) => {
                                                                    const p = products.find(prod => prod.id === item.productId);
                                                                    return (
                                                                        <tr key={iIdx}>
                                                                            <td className="px-6 py-4">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                                                                                        <img src={p?.imageUrl} className="w-full h-full object-cover" />
                                                                                    </div>
                                                                                    <span className="font-black text-gray-800 text-xs uppercase tracking-tight">{p?.name || 'Unknown Produce'}</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 text-center font-bold text-gray-500 text-xs">{item.quantityKg}{p?.unit || 'kg'}</td>
                                                                            <td className="px-6 py-4 text-right font-black text-indigo-400 text-xs">${item.pricePerKg.toFixed(2)}</td>
                                                                            <td className="px-6 py-4 text-right font-black text-indigo-600 text-sm">${(item.quantityKg * item.pricePerKg).toFixed(2)}</td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                            <tfoot className="bg-indigo-50/30 font-black text-xs uppercase tracking-widest text-indigo-700">
                                                                <tr>
                                                                    <td colSpan={3} className="px-6 py-4 text-right">Invoice Total</td>
                                                                    <td className="px-6 py-4 text-right text-base tracking-tighter">${order.totalAmount.toFixed(2)}</td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Platform Zero Operations Protocol v3.1</p>
                    <button onClick={onClose} className="px-12 py-3.5 bg-[#0F172A] hover:bg-black text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all active:scale-95">Return to Control Center</button>
                </div>
            </div>
        </div>
    );
};

const RepAssignmentModal = ({ isOpen, onClose, customer, reps, onUpdate }: { isOpen: boolean, onClose: () => void, customer: Customer | null, reps: User[], onUpdate: () => void }) => {
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen || !customer) return null;

    const handleAssign = async (repId: string) => {
        setIsSaving(true);
        mockService.updateCustomerRep(customer.id, repId);
        await new Promise(r => setTimeout(r, 600));
        setIsSaving(false);
        onUpdate();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Assign Sales Rep</h2>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">{customer.businessName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2"><X size={24}/></button>
                </div>
                
                <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {reps.map(rep => (
                        <button 
                            key={rep.id}
                            onClick={() => handleAssign(rep.id)}
                            disabled={isSaving}
                            className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all group ${customer.assignedPzRepId === rep.id ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-gray-50 hover:border-indigo-100 bg-white'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${customer.assignedPzRepId === rep.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {rep.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-gray-900 uppercase text-xs">{rep.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Market Representative</p>
                                </div>
                            </div>
                            {customer.assignedPzRepId === rep.id && <CheckCircle size={20} className="text-indigo-600"/>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MarkupEditorModal = ({ isOpen, onClose, customer, onUpdate }: { isOpen: boolean, onClose: () => void, customer: Customer | null, onUpdate: () => void }) => {
    const [markup, setMarkup] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (customer) setMarkup((customer.pzMarkup || 15).toString());
    }, [customer]);

    if (!isOpen || !customer) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        mockService.updateCustomerMarkup(customer.id, parseFloat(markup));
        await new Promise(r => setTimeout(r, 600));
        setIsSaving(false);
        onUpdate();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Configure PZ Markup</h2>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">{customer.businessName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2"><X size={24}/></button>
                </div>
                
                <form onSubmit={handleSave} className="p-10 space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Platform Sales Margin (%)</label>
                            <div className="relative group">
                                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={24}/>
                                <input 
                                    required 
                                    type="number" 
                                    step="0.1"
                                    className="w-full pl-14 pr-6 py-6 bg-gray-50 border-2 border-gray-100 rounded-[1.75rem] font-black text-4xl text-gray-900 outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-inner-sm" 
                                    value={markup} 
                                    onChange={e => setMarkup(e.target.value)} 
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                                <Info size={12}/> This markup is applied to all source prices for this buyer.
                            </p>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-5 bg-[#043003] text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-100 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20}/> : <><CheckCircle size={20}/> Update Trade Logic</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

const ActionDropdown = ({ customer, onEditMarkup, onAssignRep, onViewOps }: { customer: Customer, onEditMarkup: (c: Customer) => void, onAssignRep: (c: Customer) => void, onViewOps: (c: Customer) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (label: string) => {
      setIsOpen(false);
      if (label === 'Configure Markup') onEditMarkup(customer);
      if (label === 'Assign Sales Rep') onAssignRep(customer);
      if (label === 'View Operations') onViewOps(customer);
  };

  const menuItems = [
    { label: 'View Operations', icon: Eye, color: 'text-indigo-600' },
    { label: 'Edit Pricing', icon: Pencil, color: 'text-emerald-600' },
    { label: 'Set Pricing Tier', icon: Percent, color: 'text-purple-500' },
    { label: 'Configure Markup', icon: Settings, color: 'text-orange-500' },
    { label: 'Assign Sales Rep', icon: UserPlus, color: 'text-slate-500', border: true },
    { label: 'Assign Accounts Rep', icon: FileText, color: 'text-slate-500' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-xl transition-all border ${isOpen ? 'bg-gray-100 border-gray-200 text-gray-900 shadow-inner' : 'bg-white border-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
      >
        <MoreVertical size={20}/>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] py-2 animate-in zoom-in-95 duration-150 origin-top-right">
          {menuItems.map((item, idx) => (
            <React.Fragment key={item.label}>
              {item.border && <div className="h-px bg-gray-50 my-2 mx-4" />}
              <button 
                onClick={() => handleAction(item.label)}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
              >
                <div className={`${item.color} transition-transform group-hover:scale-110`}>
                    <item.icon size={18} />
                </div>
                <span className="text-sm font-bold text-gray-700 tracking-tight">{item.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    gmv: 0,
    ordersToday: 0,
    wholesalers: 0,
    wasteDiverted: 0,
    co2Saved: 0
  });
  const [activeDrillDown, setActiveDrillDown] = useState<DrillDownType>(null);
  const [drillDownCustomerId, setDrillDownCustomerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pzReps, setPzReps] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  // Drill-down UI State
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  // Modal States
  const [editingMarkupCustomer, setEditingMarkupCustomer] = useState<Customer | null>(null);
  const [editingRepCustomer, setEditingRepCustomer] = useState<Customer | null>(null);
  const [viewingOpsCustomer, setViewingOpsCustomer] = useState<Customer | null>(null);

  // Data for Drill Downs
  const [drillDownList, setDrillDownList] = useState<Order[]>([]);
  const [wholesalersList, setWholesalersList] = useState<User[]>([]);
  const [revenueByEntity, setRevenueByEntity] = useState<any[]>([]);

  const loadStats = () => {
      const orders = mockService.getOrders('u1');
      const users = mockService.getAllUsers();
      const products = mockService.getAllProducts();
      const reqs = mockService.getRegistrationRequests().filter(r => r.status === 'Pending');
      const customersList = mockService.getCustomers();
      const reps = mockService.getPzRepresentatives();
      
      setAllOrders(orders);
      setAllProducts(products);
      setPzReps(reps);
      setAllUsers(users);
      
      const today = new Date().toDateString();
      const todaysOrders = orders.filter(o => new Date(o.date).toDateString() === today);
      const totalGmv = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const wholesalers = users.filter(u => u.role === UserRole.WHOLESALER);

      const revMap: Record<string, number> = {};
      orders.forEach(o => {
        revMap[o.buyerId] = (revMap[o.buyerId] || 0) + o.totalAmount;
      });
      const revByEntity = Object.entries(revMap).map(([id, amount]) => ({
        entity: users.find(u => u.id === id)?.businessName || customersList.find(c => c.id === id)?.businessName || 'Guest User',
        amount
      })).sort((a, b) => b.amount - a.amount);

      let totalWaste = 0;
      let totalCo2 = 0;
      orders.forEach(order => {
          order.items.forEach(item => {
              const p = products.find(prod => prod.id === item.productId);
              totalWaste += item.quantityKg;
              totalCo2 += item.quantityKg * (p?.co2SavingsPerKg || 0.8);
          });
      });
      
      setPendingCount(reqs.length);
      setStats({
        gmv: totalGmv,
        ordersToday: todaysOrders.length,
        wholesalers: wholesalers.length,
        wasteDiverted: totalWaste,
        co2Saved: totalCo2
      });
      setCustomers(customersList);
      setWholesalersList(wholesalers);
      setRevenueByEntity(revByEntity);
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Aggregated Customer Metrics
  const customerFinancials = useMemo(() => {
    const map: Record<string, { orders: number, outstanding: number, ltv: number, profit: number }> = {};
    
    allOrders.forEach(o => {
        if (!map[o.buyerId]) map[o.buyerId] = { orders: 0, outstanding: 0, ltv: 0, profit: 0 };
        const m = map[o.buyerId];
        m.orders += 1;
        m.ltv += o.totalAmount;
        if (o.paymentStatus !== 'Paid') {
            m.outstanding += o.totalAmount;
        }
        const customer = customers.find(c => c.id === o.buyerId);
        const markup = customer?.pzMarkup || 15; 
        m.profit += o.totalAmount * (markup / 100);
    });

    return map;
  }, [allOrders, customers]);

  const filteredCustomers = customers.filter(c => 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const kpis = [
    { 
        id: 'ORDERS',
        label: 'Orders Today', 
        value: stats.ordersToday, 
        icon: Activity, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50',
        live: true,
        desc: 'Incoming live volume'
    },
    { 
        id: 'WHOLESALERS',
        label: 'Live Wholesalers', 
        value: stats.wholesalers, 
        icon: Globe, 
        color: 'text-indigo-600', 
        bg: 'bg-indigo-50',
        live: true,
        desc: 'Active network nodes'
    },
    { 
        id: 'REVENUE',
        label: 'Market Revenue', 
        value: `$${stats.gmv.toLocaleString()}`, 
        icon: DollarSign, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50',
        desc: 'Total platform GMV'
    },
    { 
        id: 'IMPACT',
        label: 'Ecological Impact', 
        value: `${stats.wasteDiverted.toLocaleString()}kg`, 
        icon: Leaf, 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-50',
        live: true,
        desc: 'Waste diverted to buyers'
    }
  ];

  const handleKpiClick = (id: string) => {
    setDrillDownCustomerId(null);
    setExpandedInvoiceId(null);
    if (id === 'IMPACT') {
      navigate('/impact');
    } else {
        if (id === 'ORDERS') setDrillDownList(allOrders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()));
        setActiveDrillDown(id as DrillDownType);
    }
  };

  const handleCustomerOrdersDrillDown = (customerId: string) => {
    const cust = customers.find(c => c.id === customerId);
    if (cust) setViewingOpsCustomer(cust);
  };

  const handleCustomerLedgerDrillDown = (customerId: string) => {
    setDrillDownCustomerId(customerId);
    setExpandedInvoiceId(null);
    setDrillDownList(allOrders.filter(o => o.buyerId === customerId && o.paymentStatus !== 'Paid'));
    setActiveDrillDown('LEDGER');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">HQ Control Center</h1>
          <p className="text-gray-500 font-medium mt-2">Overseeing marketplace growth and partner relationships.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <button 
                onClick={() => navigate('/login-requests')} 
                className="relative flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95 group"
            >
                Review Requests
                {pendingCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-bounce border-2 border-white ring-4 ring-red-500/10">
                        {pendingCount}
                    </span>
                )}
            </button>
            <button 
                onClick={() => navigate('/negotiations')} 
                className="flex-1 sm:flex-none px-6 py-3 bg-[#043003] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all active:scale-95"
            >
                View Pipeline
            </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
            <button 
              key={idx} 
              onClick={() => handleKpiClick(kpi.id)}
              className={`text-left bg-white p-8 rounded-[2rem] shadow-sm border flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden active:scale-[0.98] ${activeDrillDown === kpi.id && !drillDownCustomerId ? 'border-indigo-400 ring-2 ring-indigo-50 shadow-lg' : 'border-gray-100'}`}
            >
                {kpi.live && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
                    </div>
                )}
                
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tight mb-6">{kpi.desc}</p>
                </div>

                <div className="flex justify-between items-end">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{kpi.value}</h3>
                    <div className={`p-3 ${kpi.bg} ${kpi.color} rounded-2xl group-hover:scale-110 transition-transform shadow-inner-sm border border-white/50`}><kpi.icon size={24} /></div>
                </div>
            </button>
        ))}
      </div>

      {/* DRILL DOWN SECTION (Traditional Table Drill Downs) */}
      {activeDrillDown && (
          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl animate-in slide-in-from-top-4 duration-300 overflow-hidden">
              <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                      <div className={`p-3 bg-white rounded-2xl border border-gray-100 shadow-sm ${activeDrillDown === 'LEDGER' ? 'text-red-600' : 'text-indigo-600'}`}>
                          {activeDrillDown === 'ORDERS' ? <ShoppingCart size={24}/> : activeDrillDown === 'WHOLESALERS' ? <Globe size={24}/> : activeDrillDown === 'REVENUE' ? <DollarSign size={24}/> : <Receipt size={24}/>}
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">
                            {activeDrillDown === 'ORDERS' ? (drillDownCustomerId ? `${customers.find(c => c.id === drillDownCustomerId)?.businessName} - All Orders` : "Today's Order Manifest") : 
                             activeDrillDown === 'WHOLESALERS' ? 'Verified Partner Directory' : 
                             activeDrillDown === 'REVENUE' ? 'Market Revenue by Entity' : 
                             `${customers.find(c => c.id === drillDownCustomerId)?.businessName} - Outstanding Invoices`}
                        </h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Detailed Drill-down Analysis</p>
                      </div>
                  </div>
                  <button onClick={() => { setActiveDrillDown(null); setDrillDownCustomerId(null); setExpandedInvoiceId(null); }} className="p-3 bg-white border border-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-all shadow-sm">
                      <X size={20} strokeWidth={2.5}/>
                  </button>
              </div>

              <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                      {(activeDrillDown === 'ORDERS' || activeDrillDown === 'LEDGER') && (
                          <>
                            <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-8 py-5">Statement Date</th>
                                    <th className="px-8 py-5">Reference ID</th>
                                    <th className="px-8 py-5">Fulfillment Status</th>
                                    <th className="px-8 py-5 text-right">Items</th>
                                    <th className="px-8 py-5 text-right">Invoice Total</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {drillDownList.length === 0 ? (
                                    <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-bold italic uppercase tracking-widest">No matching records found</td></tr>
                                ) : drillDownList.map(o => {
                                    const isExpanded = expandedInvoiceId === o.id;
                                    return (
                                        <React.Fragment key={o.id}>
                                            <tr className={`transition-colors group ${isExpanded ? 'bg-indigo-50/30' : 'hover:bg-gray-50'}`}>
                                                <td className="px-8 py-6 text-sm font-bold text-gray-400">{new Date(o.date).toLocaleDateString()}</td>
                                                <td className="px-8 py-6">
                                                    <button 
                                                        onClick={() => setExpandedInvoiceId(isExpanded ? null : o.id)}
                                                        className="font-mono font-black text-xs text-indigo-600 uppercase tracking-tighter hover:underline flex items-center gap-2"
                                                    >
                                                        INV-{o.id.split('-').pop()}
                                                        {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                                    </button>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border shadow-inner-sm ${
                                                        o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                                                    }`}>{o.status}</span>
                                                </td>
                                                <td className="px-8 py-6 text-right font-black text-gray-500 text-sm">{o.items.length} Varieties</td>
                                                <td className="px-8 py-6 text-right font-black text-indigo-600 text-lg tracking-tighter">${o.totalAmount.toFixed(2)}</td>
                                                <td className="px-8 py-6 text-right">
                                                    <button 
                                                        onClick={() => setExpandedInvoiceId(isExpanded ? null : o.id)}
                                                        className={`p-2.5 rounded-xl transition-all shadow-sm border ${isExpanded ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-100 text-gray-300 hover:text-indigo-600'}`}
                                                    >
                                                        <FileText size={16}/>
                                                    </button>
                                                </td>
                                            </tr>
                                            {/* Itemized Manifest Expansion */}
                                            {isExpanded && (
                                                <tr className="bg-indigo-50/20 animate-in slide-in-from-top-2">
                                                    <td colSpan={6} className="px-8 py-0">
                                                        <div className="py-6 border-t border-indigo-100/50">
                                                            <div className="bg-white rounded-2xl border border-indigo-100 shadow-inner-sm overflow-hidden">
                                                                <table className="w-full text-left">
                                                                    <thead className="bg-indigo-50/50 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                                                        <tr>
                                                                            <th className="px-6 py-3">Product Identity</th>
                                                                            <th className="px-6 py-3 text-right">Qty</th>
                                                                            <th className="px-6 py-3 text-right">Unit Rate</th>
                                                                            <th className="px-6 py-3 text-right">Subtotal</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-indigo-50">
                                                                        {o.items.map((item, idx) => {
                                                                            const p = allProducts.find(prod => prod.id === item.productId);
                                                                            return (
                                                                                <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                                                                                    <td className="px-6 py-3">
                                                                                        <div className="flex items-center gap-3">
                                                                                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-50 border border-indigo-50 shrink-0">
                                                                                                <img src={p?.imageUrl} className="w-full h-full object-cover" />
                                                                                            </div>
                                                                                            <span className="font-black text-gray-900 text-xs uppercase tracking-tight">{p?.name || 'Unknown Item'}</span>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="px-6 py-3 text-right font-bold text-gray-500 text-xs">{item.quantityKg}{p?.unit || 'kg'}</td>
                                                                                    <td className="px-6 py-3 text-right font-black text-indigo-400 text-xs">${item.pricePerKg.toFixed(2)}</td>
                                                                                    <td className="px-6 py-3 text-right font-black text-indigo-600 text-xs">${(item.quantityKg * item.pricePerKg).toFixed(2)}</td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                    <tfoot className="bg-indigo-50/30 font-black text-xs uppercase tracking-widest text-indigo-700">
                                                                        <tr>
                                                                            <td colSpan={3} className="px-6 py-4 text-right">Invoice Total</td>
                                                                            <td className="px-6 py-4 text-right text-base tracking-tighter">${o.totalAmount.toFixed(2)}</td>
                                                                        </tr>
                                                                    </tfoot>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                          </>
                      )}
                      {activeDrillDown === 'WHOLESALERS' && (
                          <>
                            <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5">Trading Entity</th>
                                    <th className="px-8 py-5">Email</th>
                                    <th className="px-8 py-5">Activity Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {wholesalersList.map(w => (
                                    <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-6 font-black text-gray-900 uppercase tracking-tight">{w.businessName}</td>
                                        <td className="px-8 py-6 font-bold text-gray-400 text-sm">{w.email}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Now</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                          </>
                      )}
                      {activeDrillDown === 'REVENUE' && (
                          <>
                            <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5">Business Identity</th>
                                    <th className="px-8 py-5 text-right">Lifetime GMV contribution</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {revenueByEntity.map((r, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-6 font-black text-gray-900 uppercase tracking-tight">{r.entity}</td>
                                        <td className="px-8 py-6 text-right font-black text-indigo-600 text-lg tracking-tighter">${r.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    </tr>
                                ))}
                            </tbody>
                          </>
                      )}
                  </table>
              </div>
          </div>
      )}

      {/* MARKETPLACE MANAGEMENT */}
      <div className="bg-white border border-gray-200 rounded-[2.5rem] shadow-sm overflow-visible">
        <div className="p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 bg-gray-50/20">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-sm border border-gray-100">
                    <Store size={32}/>
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Marketplace Management</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Global Trade Oversight & Customer Yields</p>
                </div>
            </div>
            <div className="relative w-full md:w-[420px] group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={24} />
                <input 
                    type="text" 
                    placeholder="Search market directory..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white border border-gray-200 rounded-[1.5rem] text-sm font-bold text-slate-900 focus:ring-8 focus:ring-indigo-50/50 outline-none transition-all shadow-sm" 
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
                    <tr>
                        <th className="px-8 py-8 min-w-[200px]">Customer Entity</th>
                        <th className="px-8 py-8">Segment</th>
                        <th className="px-8 py-8">Status</th>
                        <th className="px-8 py-8">Connected Supplier</th>
                        <th className="px-8 py-8 text-right">PZ Markup</th>
                        <th className="px-8 py-8 text-center">Orders</th>
                        <th className="px-8 py-8 text-center">Outstanding</th>
                        <th className="px-8 py-8 text-right">Lifetime Value</th>
                        <th className="px-8 py-8 text-right text-emerald-600">Total Profit</th>
                        <th className="px-8 py-8">Assigned Rep</th>
                        <th className="px-8 py-8 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredCustomers.map(customer => {
                        const m = customerFinancials[customer.id] || { orders: 0, outstanding: 0, ltv: 0, profit: 0 };
                        const isLedgerActive = drillDownCustomerId === customer.id && activeDrillDown === 'LEDGER';
                        
                        return (
                            <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setViewingOpsCustomer(customer)}>
                                <td className="px-8 py-7">
                                    <div className="font-black text-gray-900 text-base uppercase tracking-tight leading-none mb-1.5 group-hover:text-indigo-600 transition-colors">{customer.businessName}</div>
                                    <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{customer.email || 'NO_RECORD@SYSTEM.IO'}</div>
                                </td>
                                <td className="px-8 py-7">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-400 border border-gray-100">
                                        {customer.category}
                                    </span>
                                </td>
                                <td className="px-8 py-7">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                        customer.connectionStatus === 'Active' 
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                        : 'bg-orange-50 text-orange-600 border-orange-100'
                                    }`}>
                                        {customer.connectionStatus?.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-8 py-7">
                                    <div className="font-black text-gray-900 text-sm uppercase tracking-tight truncate max-w-[140px]">{customer.connectedSupplierName || 'Direct Connection'}</div>
                                </td>
                                <td className="px-8 py-7 text-right">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setEditingMarkupCustomer(customer); }}
                                        className="inline-flex items-center gap-1 font-black text-gray-900 text-sm hover:text-indigo-600 hover:scale-110 transition-all bg-gray-50 px-3 py-1.5 rounded-xl border border-transparent hover:border-indigo-100 shadow-inner-sm"
                                    >
                                        {customer.pzMarkup || 15}<span className="text-[10px] text-gray-400">%</span>
                                    </button>
                                </td>
                                <td className="px-8 py-7 text-center">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleCustomerOrdersDrillDown(customer.id); }}
                                        className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm ${
                                            viewingOpsCustomer?.id === customer.id
                                            ? 'bg-indigo-600 text-white shadow-indigo-100'
                                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                                        }`}
                                    >
                                        {m.orders} Total
                                    </button>
                                </td>
                                <td className="px-8 py-7 text-center">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleCustomerLedgerDrillDown(customer.id); }}
                                        disabled={m.outstanding === 0}
                                        className={`px-6 py-2.5 rounded-full font-black text-sm tracking-tight transition-all border-2 ${
                                            m.outstanding > 0 
                                            ? isLedgerActive
                                                ? 'bg-[#FFF1F2] text-[#E11D48] border-[#3B82F6] shadow-md scale-105'
                                                : 'bg-[#FFF1F2] text-[#E11D48] border-transparent hover:border-[#3B82F6] shadow-sm' 
                                            : 'bg-gray-50 text-gray-300 cursor-not-allowed border-transparent opacity-50'
                                        }`}
                                    >
                                        ${m.outstanding.toFixed(2)}
                                    </button>
                                </td>
                                <td className="px-8 py-7 text-right">
                                    <div className="font-black text-gray-900 text-base tracking-tighter">${m.ltv.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                </td>
                                <td className="px-8 py-7 text-right">
                                    <div className="font-black text-emerald-600 text-base tracking-tighter">${m.profit.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                </td>
                                <td className="px-8 py-7">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setEditingRepCustomer(customer); }}
                                        className="flex items-center gap-2 group/rep bg-white hover:bg-indigo-50 p-2 rounded-xl border border-transparent hover:border-indigo-100 transition-all text-left w-full"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px] uppercase group-hover/rep:bg-indigo-600 group-hover/rep:text-white transition-colors">{customer.assignedPzRepName?.charAt(0) || 'HQ'}</div>
                                        <div className="flex-1 min-w-0">
                                            <span className="font-bold text-gray-700 text-xs uppercase tracking-tight truncate block">{customer.assignedPzRepName || 'Market Rep'}</span>
                                            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover/rep:opacity-100 transition-opacity">Change Rep</span>
                                        </div>
                                    </button>
                                </td>
                                <td className="px-8 py-7 text-right">
                                    <ActionDropdown 
                                        customer={customer} 
                                        onEditMarkup={setEditingMarkupCustomer} 
                                        onAssignRep={setEditingRepCustomer}
                                        onViewOps={setViewingOpsCustomer}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      <MarkupEditorModal 
        isOpen={!!editingMarkupCustomer} 
        onClose={() => setEditingMarkupCustomer(null)}
        customer={editingMarkupCustomer}
        onUpdate={loadStats}
      />

      <RepAssignmentModal 
        isOpen={!!editingRepCustomer}
        onClose={() => setEditingRepCustomer(null)}
        customer={editingRepCustomer}
        reps={pzReps}
        onUpdate={loadStats}
      />

      <CustomerOpsModal 
        isOpen={!!viewingOpsCustomer}
        onClose={() => setViewingOpsCustomer(null)}
        customer={viewingOpsCustomer}
        allOrders={allOrders}
        products={allProducts}
        allUsers={allUsers}
      />
    </div>
  );
};
