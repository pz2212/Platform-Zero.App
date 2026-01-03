
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Order, UserRole, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  DollarSign, TrendingUp, TrendingDown, Users, 
  ArrowUpRight, ArrowDownLeft, Filter, Search,
  Download, FileText, CheckCircle2, AlertCircle, Clock,
  Wallet, ShieldCheck, ChevronRight, BarChart3, Receipt,
  X, Landmark, ArrowRight, Building, Package, Timer, ArrowLeft,
  Banknote, Info, Upload, Image as ImageIcon, FileCheck, Eye, RefreshCw
} from 'lucide-react';

interface ReceiptPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title: string;
    onReplace: () => void;
}

const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({ isOpen, onClose, url, title, onReplace }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
                <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <FileText size={24}/>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{title}</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Platform Zero Document Vault</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => { onReplace(); onClose(); }}
                            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                        >
                            <RefreshCw size={14}/> Replace Document
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-300 hover:text-gray-900 transition-colors bg-white rounded-full border border-gray-100 shadow-sm">
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 bg-gray-200 overflow-auto p-4 md:p-10 flex items-center justify-center min-h-[400px]">
                    <img src={url} className="max-w-full rounded-2xl shadow-2xl border-8 border-white" alt="Receipt Preview" />
                </div>
                <div className="p-6 bg-white border-t border-gray-100 flex justify-center gap-4">
                    <button onClick={onClose} className="px-10 py-3 bg-[#0F172A] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Close Vault</button>
                </div>
            </div>
        </div>
    );
};

interface EntityDetailsProps {
    entity: any;
    orders: Order[];
    customerProfile: Customer | null;
    allUsers: User[];
    activeTab: 'RECEIVABLES' | 'PAYABLES';
    onClose: () => void;
    onRefresh: () => void;
}

const SupplierBankPopover = ({ supplier, order, onClose, onRemit }: { supplier: User, order: Order, onClose: () => void, onRemit: (orderId: string) => void }) => (
    <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 text-white rounded-3xl shadow-2xl p-6 z-[100] animate-in zoom-in-95 duration-200 border border-white/10">
        <div className="flex justify-between items-start mb-4">
            <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30">
                <Landmark size={20} className="text-indigo-400"/>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={18}/>
            </button>
        </div>
        <div className="space-y-4">
            <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Settlement Entity</p>
                <p className="font-black text-sm uppercase tracking-tight truncate">{supplier.businessName}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 pt-3 border-t border-white/5">
                <div>
                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Institution</p>
                    <p className="text-xs font-bold">{supplier.businessProfile?.bankName || 'CommonBank'}</p>
                </div>
                <div className="flex justify-between">
                    <div>
                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">BSB</p>
                        <p className="text-xs font-mono font-black">{supplier.businessProfile?.bsb || '000-000'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Account Number</p>
                        <p className="text-xs font-mono font-black">{supplier.businessProfile?.accountNumber || '12345678'}</p>
                    </div>
                </div>
            </div>
        </div>
        <div className="mt-6 pt-4 border-t border-white/5">
            <button 
                onClick={() => onRemit(order.id)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
            >
                {order.supplierPayoutStatus === 'Remitted' ? 'Update Remittance' : 'Mark as Remitted'}
            </button>
        </div>
    </div>
);

const EntityDetails: React.FC<EntityDetailsProps> = ({ entity, orders, customerProfile, allUsers, activeTab, onClose, onRefresh }) => {
    const [activeSupplierBankId, setActiveSupplierBankId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingForOrderId, setUploadingForOrderId] = useState<string | null>(null);
    const [uploadType, setUploadType] = useState<'CUSTOMER_PAYMENT' | 'SUPPLIER_PAYOUT' | null>(null);
    const [viewingReceipt, setViewingReceipt] = useState<{ url: string, title: string, orderId: string, type: 'CUSTOMER_PAYMENT' | 'SUPPLIER_PAYOUT' } | null>(null);

    const getInvoiceDetails = (order: Order) => {
        const orderDate = new Date(order.date);
        const pzTerms = customerProfile?.pzPaymentTermsDays || 7;
        const supplierTerms = customerProfile?.supplierPaymentTermsDays || 14;

        const pzDueDate = new Date(orderDate);
        pzDueDate.setDate(pzDueDate.getDate() + pzTerms);

        const supplierDueDate = new Date(orderDate);
        supplierDueDate.setDate(supplierDueDate.getDate() + supplierTerms);

        const markup = customerProfile?.pzMarkup || 15;
        const supplierOwed = order.totalAmount / (1 + (markup / 100));
        const pzProfit = order.totalAmount - supplierOwed;

        return {
            pzDueDate,
            supplierDueDate,
            supplierOwed,
            pzProfit
        };
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && uploadingForOrderId) {
            const mockUrl = URL.createObjectURL(file);
            if (uploadType === 'CUSTOMER_PAYMENT') {
                mockService.markOrderAsPaid(uploadingForOrderId, mockUrl);
            } else {
                mockService.markOrderAsRemitted(uploadingForOrderId, mockUrl);
            }
            setUploadingForOrderId(null);
            setUploadType(null);
            onRefresh();
        }
    };

    const triggerUpload = (orderId: string, type: 'CUSTOMER_PAYMENT' | 'SUPPLIER_PAYOUT') => {
        setUploadingForOrderId(orderId);
        setUploadType(type);
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-10 duration-500 relative">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={handleFileSelect} 
            />

            <ReceiptPreviewModal 
                isOpen={!!viewingReceipt}
                onClose={() => setViewingReceipt(null)}
                url={viewingReceipt?.url || ''}
                title={viewingReceipt?.title || ''}
                onReplace={() => viewingReceipt && triggerUpload(viewingReceipt.orderId, viewingReceipt.type)}
            />

            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all text-gray-400 hover:text-gray-900">
                        <ArrowLeft size={24}/>
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">{entity.name}</h2>
                        <div className="flex items-center gap-4 mt-2">
                             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">Trade Identity: {customerProfile?.id || 'HQ_RECORD'}</span>
                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5"><Clock size={12}/> Net Terms: {customerProfile?.pzPaymentTermsDays || 7} Days</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-all shadow-sm">Statement PDF</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-inner-sm">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Primary Supplier Anchor</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-indigo-600 font-black text-sm">
                                {customerProfile?.connectedSupplierName?.charAt(0) || 'S'}
                            </div>
                            <span className="font-black text-gray-900 text-sm uppercase">{customerProfile?.connectedSupplierName || 'Wholesale Network'}</span>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-inner-sm">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Supplier Settlement Loop</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-emerald-600">
                                <Timer size={20}/>
                            </div>
                            <span className="font-black text-gray-900 text-sm uppercase">Net {customerProfile?.supplierPaymentTermsDays || 14} Days Payout</span>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-inner-sm">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Verified Profit Margin</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-indigo-600 font-black text-sm">
                                {customerProfile?.pzMarkup || 15}%
                            </div>
                            <span className="font-black text-gray-900 text-sm uppercase">Platform Service Fee</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 overflow-visible shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5">Invoice Reference</th>
                                <th className="px-8 py-5 text-right">Customer Due</th>
                                <th className="px-8 py-5 text-right">Supplier Payout Due</th>
                                <th className="px-8 py-5 text-right">Buyer Total</th>
                                <th className="px-8 py-5 text-right">Wholesale Cost</th>
                                <th className="px-8 py-5 text-right text-indigo-600">PZ Profit</th>
                                <th className="px-8 py-5 text-right">Settlement</th>
                                <th className="px-8 py-5 text-right">Vault Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.map(order => {
                                const details = getInvoiceDetails(order);
                                const supplier = allUsers.find(u => u.id === order.sellerId);
                                const isBankOpen = activeSupplierBankId === order.id;

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group/row">
                                        <td className="px-8 py-6">
                                            <div className="font-mono font-black text-gray-900 text-xs">INV-{order.id.split('-').pop()}</div>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Logged: {new Date(order.date).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="font-bold text-gray-900 text-sm">{details.pzDueDate.toLocaleDateString()}</span>
                                            <p className="text-[9px] text-gray-400 uppercase font-black">Net Customer Terms</p>
                                        </td>
                                        <td className="px-8 py-6 text-right relative">
                                            <button 
                                                onClick={() => setActiveSupplierBankId(isBankOpen ? null : order.id)}
                                                className={`text-right group p-2 -mr-2 rounded-xl transition-all ${isBankOpen ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-indigo-50'}`}
                                            >
                                                <span className={`block font-bold text-sm ${isBankOpen ? 'text-white' : 'text-indigo-600'}`}>{details.supplierDueDate.toLocaleDateString()}</span>
                                                <p className={`text-[9px] uppercase font-black flex items-center justify-end gap-1 ${isBankOpen ? 'text-indigo-200' : 'text-indigo-400'}`}>
                                                    <Landmark size={10}/> View Payout Account
                                                </p>
                                            </button>
                                            {isBankOpen && supplier && (
                                                <SupplierBankPopover 
                                                    supplier={supplier} 
                                                    order={order}
                                                    onClose={() => setActiveSupplierBankId(null)} 
                                                    onRemit={(id) => triggerUpload(id, 'SUPPLIER_PAYOUT')}
                                                />
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-gray-900 text-base">${order.totalAmount.toFixed(2)}</td>
                                        <td className="px-8 py-6 text-right font-black text-gray-400 text-sm">${details.supplierOwed.toFixed(2)}</td>
                                        <td className="px-8 py-6 text-right font-black text-indigo-700 text-base bg-indigo-50/30">${details.pzProfit.toFixed(2)}</td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end gap-1.5">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${
                                                    order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-inner-sm' : 'bg-orange-50 text-orange-600 border-orange-100'
                                                }`}>
                                                    Buyer: {order.paymentStatus || 'Unpaid'}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${
                                                    order.supplierPayoutStatus === 'Remitted' ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-inner-sm' : 'bg-slate-100 text-slate-400 border-slate-200'
                                                }`}>
                                                    Supplier: {order.supplierPayoutStatus || 'Pending'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Customer Settlement Actions */}
                                                <div className="flex items-center gap-1 group/btn">
                                                    {order.paymentStatus === 'Paid' ? (
                                                        <>
                                                            <button 
                                                                onClick={() => setViewingReceipt({ url: order.customerReceiptUrl!, title: 'Customer Payment Receipt', orderId: order.id, type: 'CUSTOMER_PAYMENT' })}
                                                                className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 rounded-xl shadow-sm transition-all"
                                                                title="View Customer Receipt"
                                                            >
                                                                <FileCheck size={18}/>
                                                            </button>
                                                            <button 
                                                                onClick={() => triggerUpload(order.id, 'CUSTOMER_PAYMENT')}
                                                                className="p-2.5 bg-white text-gray-400 hover:text-indigo-600 border border-gray-100 rounded-xl shadow-sm transition-all opacity-0 group-hover/row:opacity-100"
                                                                title="Replace Customer Receipt"
                                                            >
                                                                <RefreshCw size={14}/>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button 
                                                            onClick={() => triggerUpload(order.id, 'CUSTOMER_PAYMENT')}
                                                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-md"
                                                        >
                                                            <Upload size={12}/> Mark Paid
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Supplier Settlement Actions */}
                                                <div className="flex items-center gap-1">
                                                    {order.supplierPayoutStatus === 'Remitted' && (
                                                        <>
                                                            <button 
                                                                onClick={() => setViewingReceipt({ url: order.supplierReceiptUrl!, title: 'Supplier Remittance Proof', orderId: order.id, type: 'SUPPLIER_PAYOUT' })}
                                                                className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 rounded-xl shadow-sm transition-all"
                                                                title="View Remittance Receipt"
                                                            >
                                                                <Landmark size={18}/>
                                                            </button>
                                                            <button 
                                                                onClick={() => triggerUpload(order.id, 'SUPPLIER_PAYOUT')}
                                                                className="p-2.5 bg-white text-gray-400 hover:text-indigo-600 border border-gray-100 rounded-xl shadow-sm transition-all opacity-0 group-hover/row:opacity-100"
                                                                title="Replace Remittance Receipt"
                                                            >
                                                                <RefreshCw size={14}/>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const AdminAccounts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RECEIVABLES' | 'PAYABLES'>('RECEIVABLES');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setAllOrders(mockService.getOrders('u1'));
    setAllUsers(mockService.getAllUsers());
    setCustomers(mockService.getCustomers());
  };

  const accountsSummary = useMemo(() => {
    const buyersMap: Record<string, { id: string, name: string, owed: number, total: number, lastOrder: string, status: string }> = {};
    const suppliersMap: Record<string, { id: string, name: string, owed: number, total: number, lastFulfill: string }> = {};

    allOrders.forEach(o => {
        if (!buyersMap[o.buyerId]) {
            const buyer = customers.find(c => c.id === o.buyerId) || allUsers.find(u => u.id === o.buyerId);
            buyersMap[o.buyerId] = { 
                id: o.buyerId,
                name: buyer?.businessName || 'Unknown Buyer', 
                owed: 0, 
                total: 0, 
                lastOrder: o.date,
                status: 'ACTIVE'
            };
        }
        buyersMap[o.buyerId].total += o.totalAmount;
        if (o.paymentStatus !== 'Paid') {
            buyersMap[o.buyerId].owed += o.totalAmount;
        }

        if (!suppliersMap[o.sellerId]) {
            const supplier = allUsers.find(u => u.id === o.sellerId);
            suppliersMap[o.sellerId] = { 
                id: o.sellerId,
                name: supplier?.businessName || 'Unknown Supplier', 
                owed: 0, 
                total: 0, 
                lastFulfill: o.date 
            };
        }
        suppliersMap[o.sellerId].total += o.totalAmount;
        if (o.supplierPayoutStatus !== 'Remitted') {
            const customer = customers.find(c => c.id === o.buyerId);
            const markup = customer?.pzMarkup || 15;
            suppliersMap[o.sellerId].owed += o.totalAmount / (1 + (markup/100));
        }
    });

    return { 
        buyers: Object.values(buyersMap).sort((a, b) => b.owed - a.owed),
        suppliers: Object.values(suppliersMap).sort((a, b) => b.owed - a.owed)
    };
  }, [allOrders, customers, allUsers]);

  const totalReceivables = accountsSummary.buyers.reduce((sum, b) => sum + b.owed, 0);
  const totalPayables = accountsSummary.suppliers.reduce((sum, s) => sum + s.owed, 0);

  const filteredData = activeTab === 'RECEIVABLES' 
    ? accountsSummary.buyers.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : accountsSummary.suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleEntityClick = (entity: any) => {
    setSelectedEntity(entity);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
      {selectedEntity && (
          <div className="fixed inset-0 z-[100] pl-64 bg-black/10 backdrop-blur-[2px] animate-in fade-in">
              <div className="h-full w-full flex justify-end">
                  <div className="h-full w-full lg:w-[85%] shadow-2xl">
                      <EntityDetails 
                        entity={selectedEntity} 
                        orders={allOrders.filter(o => activeTab === 'RECEIVABLES' ? o.buyerId === selectedEntity.id : o.sellerId === selectedEntity.id)}
                        customerProfile={customers.find(c => c.id === selectedEntity.id) || null}
                        allUsers={allUsers}
                        activeTab={activeTab}
                        onClose={() => setSelectedEntity(null)}
                        onRefresh={loadData}
                      />
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Global Ledger</h1>
          <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-widest">Platform Zero Clearing House Oversight</p>
        </div>
        <div className="flex gap-3">
            <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-all flex items-center gap-2">
                <Download size={16}/> Export Full Ledger
            </button>
            <button className="px-8 py-3 bg-[#043003] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all">
                Manual Settlement
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 transform rotate-12 scale-150 group-hover:scale-[1.8] transition-transform duration-700">
            <ArrowDownLeft size={120} className="text-emerald-900" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Market Receivables (Buyers)</p>
            <h3 className="text-5xl font-black tracking-tighter text-emerald-600">${totalReceivables.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-2">Money owed to Platform Zero</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 transform -rotate-12 scale-150 group-hover:scale-[1.8] transition-transform duration-700">
            <ArrowUpRight size={120} className="text-amber-900" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Market Payables (Suppliers)</p>
            <h3 className="text-5xl font-black tracking-tighter text-amber-600">${totalPayables.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-2">Money owed by Platform Zero</p>
          </div>
        </div>

        <div className="bg-[#0B1221] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-45 scale-150 group-hover:scale-[1.8] transition-transform duration-700">
            <Wallet size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">Platform Net Liquidity</p>
            <h3 className="text-5xl font-black tracking-tighter text-white">${(totalReceivables - totalPayables).toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            <div className="mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-emerald-400/60 text-[9px] font-bold uppercase tracking-widest">Live Clearing Balance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-8 shrink-0">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-md border border-gray-100 shrink-0">
                    <Receipt size={28}/>
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Entity Ledger</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Individual profile accounting breakdown</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 border border-gray-200 shadow-inner-sm">
                    <button 
                        onClick={() => setActiveTab('RECEIVABLES')}
                        className={`px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'RECEIVABLES' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Market Buyers
                    </button>
                    <button 
                        onClick={() => setActiveTab('PAYABLES')}
                        className={`px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'PAYABLES' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Suppliers
                    </button>
                </div>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Filter entity..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm" 
                    />
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] border-b border-gray-100 sticky top-0 z-10">
                    <tr>
                        <th className="px-10 py-8">Business Identity</th>
                        <th className="px-10 py-8">Trading Status</th>
                        <th className="px-10 py-8 text-right">Total Transacted</th>
                        <th className="px-10 py-8 text-right">
                            {activeTab === 'RECEIVABLES' ? 'Currently Owes PZ' : 'PZ Owed to Them'}
                        </th>
                        <th className="px-10 py-8 text-right">Last Entry</th>
                        <th className="px-10 py-8 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                    {filteredData.map((entity, idx) => (
                        <tr key={idx} onClick={() => handleEntityClick(entity)} className="hover:bg-gray-50/80 transition-all group cursor-pointer">
                            <td className="px-10 py-8">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner-sm border ${
                                        activeTab === 'RECEIVABLES' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    }`}>
                                        {entity.name.charAt(0)}
                                    </div>
                                    <div className="font-black text-gray-900 text-base uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{entity.name}</div>
                                </div>
                            </td>
                            <td className="px-10 py-8">
                                {activeTab === 'RECEIVABLES' ? (
                                    entity.owed > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-100 shadow-sm flex items-center gap-1.5 animate-pulse">
                                                <AlertCircle size={12}/> TRADE BLOCKED
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm flex items-center gap-1.5">
                                            <CheckCircle2 size={12}/> CLEAR TO TRADE
                                        </span>
                                    )
                                ) : (
                                    entity.owed > 0 ? (
                                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm flex items-center gap-1.5">
                                            <Clock size={12}/> PAYOUT PENDING
                                        </span>
                                    ) : (
                                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm flex items-center gap-1.5">
                                            <CheckCircle2 size={12}/> SETTLED
                                        </span>
                                    )
                                )}
                            </td>
                            <td className="px-10 py-8 text-right font-black text-gray-400 text-sm tracking-tight">
                                ${entity.total.toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </td>
                            <td className={`px-10 py-8 text-right font-black text-2xl tracking-tighter ${
                                activeTab === 'RECEIVABLES' ? 'text-emerald-700' : 'text-amber-600'
                            }`}>
                                ${entity.owed.toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </td>
                            <td className="px-10 py-8 text-right font-bold text-gray-400 text-xs">
                                {new Date('lastOrder' in entity ? entity.lastOrder : entity.lastFulfill).toLocaleDateString()}
                            </td>
                            <td className="px-10 py-8 text-right">
                                <button className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-300 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all shadow-sm active:scale-90">
                                    <ChevronRight size={18}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredData.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-10 py-32 text-center text-gray-300">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search size={40} className="opacity-20"/>
                                </div>
                                <p className="font-black uppercase tracking-widest text-xs">No matching ledger records</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
