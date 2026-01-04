import React, { useState, useEffect } from 'react';
import { mockService } from '../services/mockDataService';
import { Order, OrderIssue, Customer, User, UserRole } from '../types';
import { CommLog } from '../services/emailService';
import { 
  ShoppingCart, Package, Truck, CheckCircle, Clock, AlertCircle, 
  MessageSquare, User as UserIcon, Store, ChevronRight, Activity, 
  ArrowRight, ShieldCheck, Timer, Gavel, Eye, AlertTriangle, Loader2,
  Check,
  PackageCheck,
  FileWarning,
  UserCheck,
  History,
  Scale,
  Mail,
  Smartphone,
  ChevronDown,
  // Added missing ArrowLeft icon
  ArrowLeft
} from 'lucide-react';

export const AdminMarketOps: React.FC = () => {
  const [mobileTab, setMobileTab] = useState<'FLOW' | 'DISPUTES' | 'COMMS'>('FLOW');
  const [flowSubTab, setFlowSubTab] = useState<'TRANSIT' | 'DELIVERED'>('TRANSIT');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [issues, setIssues] = useState<OrderIssue[]>([]);
  const [commLogs, setCommLogs] = useState<CommLog[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [now, setNow] = useState(new Date());

  const [selectedLog, setSelectedLog] = useState<CommLog | null>(null);

  useEffect(() => {
    const load = () => {
        setOrders(mockService.getOrders('u1'));
        setIssues(mockService.getTodayIssues());
        setCommLogs(mockService.getCommunicationLogs());
        setCustomers(mockService.getCustomers());
        setUsers(mockService.getAllUsers());
    };
    load();
    const dataInterval = setInterval(load, 5000);
    const timeInterval = setInterval(() => setNow(new Date()), 1000);
    return () => {
        clearInterval(dataInterval);
        clearInterval(timeInterval);
    };
  }, []);

  const transitOrders = orders.filter(o => ['Pending', 'Confirmed', 'Ready for Delivery', 'Shipped'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');

  const getWholesalerName = (id: string) => users.find(u => u.id === id)?.businessName || 'PZ Partner';
  const getBuyerName = (id: string) => customers.find(c => c.id === id)?.businessName || 'Guest';

  const getCountdown = (deliveredAt: string | undefined) => {
    if (!deliveredAt) return "00:00:00";
    const deliveredTime = new Date(deliveredAt).getTime();
    const expiryTime = deliveredTime + (90 * 60 * 1000);
    const diff = expiryTime - now.getTime();
    
    if (diff <= 0) return "PROCESSED";
    
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -mt-4 animate-in fade-in duration-500">
      
      {/* MOBILE MAIN TAB SWITCHER */}
      <div className="lg:hidden sticky top-0 z-[60] bg-[#F8FAFC]/90 backdrop-blur-md px-6 py-4 border-b border-gray-100 mb-4">
        <div className="bg-gray-100 p-1 rounded-2xl flex gap-1 shadow-inner-sm overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setMobileTab('FLOW')}
                className={`flex-1 py-3.5 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all whitespace-nowrap ${mobileTab === 'FLOW' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400'}`}
            >
                <Activity size={16}/> Flow
            </button>
            <button 
                onClick={() => setMobileTab('DISPUTES')}
                className={`flex-1 py-3.5 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all whitespace-nowrap ${mobileTab === 'DISPUTES' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400'}`}
            >
                <FileWarning size={16}/> Issues {issues.length > 0 && <span className="bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px]">{issues.length}</span>}
            </button>
            <button 
                onClick={() => setMobileTab('COMMS')}
                className={`flex-1 py-3.5 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all whitespace-nowrap ${mobileTab === 'COMMS' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-400'}`}
            >
                <Mail size={16}/> Comms
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden gap-8">
        
        {/* LEFT SIDE: MARKET FLOW OR COMM LOGS */}
        <div className={`${mobileTab === 'DISPUTES' ? 'hidden lg:flex' : 'flex'} flex-1 bg-white lg:rounded-[2.5rem] border-x lg:border border-gray-100 shadow-sm overflow-hidden flex-col h-full`}>
            
            {/* Desktop-only Tab Toggle */}
            <div className="hidden lg:flex p-1 bg-gray-100 mx-8 mt-8 rounded-2xl border border-gray-200 shadow-inner-sm">
                <button onClick={() => setMobileTab('FLOW')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileTab === 'FLOW' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Live Transactions</button>
                <button onClick={() => setMobileTab('COMMS')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileTab === 'COMMS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Communication Logs</button>
            </div>

            {mobileTab === 'FLOW' ? (
                <>
                    <div className="p-8 shrink-0">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Market Dynamics</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Trade cycle verification</p>
                            </div>
                        </div>
                        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 border border-gray-200 shadow-inner-sm">
                            <button onClick={() => setFlowSubTab('TRANSIT')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${flowSubTab === 'TRANSIT' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><Truck size={14}/> Transit</button>
                            <button onClick={() => setFlowSubTab('DELIVERED')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${flowSubTab === 'DELIVERED' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><PackageCheck size={14}/> Verification</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar bg-gray-50/30">
                        {(flowSubTab === 'TRANSIT' ? transitOrders : deliveredOrders).map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                                <div className="flex justify-between items-center gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 font-black text-lg shadow-inner-sm uppercase border border-gray-100">
                                            {getBuyerName(order.buyerId).charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-base uppercase tracking-tight mb-1 truncate max-w-[180px]">{getBuyerName(order.buyerId)}</h4>
                                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{getWholesalerName(order.sellerId)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Total Trade</p>
                                        <p className="font-black text-gray-900 text-xl tracking-tighter leading-none">${order.totalAmount.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="p-8 shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Smart Comm Ledger</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Omnichannel Dispatch History (Gemini Generated)</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3 custom-scrollbar bg-gray-50/30">
                        {commLogs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 py-32 grayscale">
                                <Mail size={64} />
                                <p className="font-black uppercase tracking-widest text-xs mt-4">No comms logged for this session</p>
                            </div>
                        ) : commLogs.map(log => (
                            <div key={log.id} onClick={() => setSelectedLog(log)} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-all cursor-pointer group">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                            <Mail size={18}/>
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-xs uppercase tracking-tight">{log.recipientName}</p>
                                            <p className="text-[10px] text-gray-400 font-bold lowercase tracking-normal">{log.recipientEmail}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">{log.status}</span>
                                        <p className="text-[9px] text-gray-300 font-black mt-1.5">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <p className="text-[11px] font-bold text-gray-500 truncate max-w-[240px] italic">"{log.subject}"</p>
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest group-hover:underline">Inspect Content</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>

        {/* RIGHT SIDE: ISSUE RESOLUTION OR COMM INSPECTION */}
        <div className={`w-full lg:w-[480px] bg-white lg:rounded-[2.5rem] border-x lg:border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full`}>
            {selectedLog && mobileTab === 'COMMS' ? (
                /* COMM INSPECTION VIEW */
                <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
                    <div className="p-8 border-b border-gray-100 bg-[#131926] text-white shrink-0">
                         <div className="flex justify-between items-center mb-6">
                            <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                <ArrowLeft size={16}/> Back to list
                            </button>
                            <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Verified Sent</span>
                         </div>
                         <h3 className="text-xl font-black uppercase tracking-tight leading-tight">{selectedLog.subject}</h3>
                         <div className="mt-6 flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400"><UserIcon size={20}/></div>
                             <div>
                                <p className="text-xs font-black uppercase tracking-tight">{selectedLog.recipientName}</p>
                                <p className="text-[10px] text-slate-400 font-bold tracking-normal">{selectedLog.recipientEmail}</p>
                             </div>
                         </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/30">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-inner-sm text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                            {selectedLog.body}
                        </div>
                        <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <ShieldCheck size={24}/>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                Content generated by <span className="text-indigo-600 font-black">Platform Intelligence v3.1</span>. Logged via SendGrid API integration layer.
                            </p>
                        </div>
                    </div>
                    <div className="p-8 border-t border-gray-100 bg-white">
                        <button className="w-full py-4 bg-[#0F172A] hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all active:scale-95">Resend Message</button>
                    </div>
                </div>
            ) : (
                /* DEFAULT DISPUTES VIEW (MATCHING PREVIOUS TURN SCREENSHOT) */
                <>
                    <div className="p-8 border-b border-gray-100 bg-[#131926] text-white shrink-0 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 transform rotate-12 scale-150"><Gavel size={120} /></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-5 mb-2">
                                <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30 border border-white/10 shrink-0"><FileWarning size={28} className="text-white" /></div>
                                <h2 className="text-2xl font-black uppercase tracking-tight leading-none">Market Quality<br/>Disputes</h2>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-3">Active Produce & Delivery Reports</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 custom-scrollbar">
                        {issues.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-32 grayscale">
                                <ShieldCheck size={56} className="text-gray-300 mb-4" />
                                <p className="text-sm font-black uppercase tracking-widest">All orders verified & settled</p>
                            </div>
                        ) : issues.map(issue => (
                            <div key={issue.id} className="bg-white rounded-[2.5rem] border-2 border-red-50/50 p-7 md:p-8 shadow-sm hover:shadow-2xl hover:border-red-100 transition-all animate-in slide-in-from-right-4 duration-500 overflow-hidden relative group">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="text-[10px] font-black bg-red-50 text-red-500 px-4 py-1.5 rounded-xl uppercase tracking-widest border border-red-100 shadow-inner-sm">Produce Dispute</span>
                                        <h3 className="font-black text-gray-900 text-2xl uppercase tracking-tighter mt-4 leading-none">{getBuyerName(orders.find(o => o.id === issue.orderId)?.buyerId || '')}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Reported</p>
                                        <p className="text-lg font-black text-gray-900 tracking-tighter leading-none">{new Date(issue.reportedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}</p>
                                    </div>
                                </div>
                                <div className="bg-red-50/20 p-6 rounded-3xl border border-red-50 mb-8">
                                    <p className="text-red-900 font-bold text-[15px] italic leading-relaxed">"{issue.description}"</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex items-center gap-2">
                                                <Store size={18} className="text-indigo-400"/>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Supplier Response</p>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg border shadow-inner-sm ${
                                                issue.supplierStatus === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            }`}>{issue.supplierStatus}</span>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-center justify-between">
                                            {issue.supplierStatus === 'PENDING' ? (
                                                <div className="flex items-center gap-3 text-gray-400 italic text-sm"><Loader2 size={16} className="animate-spin" /> Awaiting Partner Action</div>
                                            ) : (
                                                <div className="flex items-center gap-3"><div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-emerald-600"><CheckCircle size={18} /></div><div><p className="text-[11px] font-black text-gray-900 uppercase">Action: {issue.supplierAction}</p><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Resolved within SLA</p></div></div>
                                            )}
                                            <button className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-300 hover:text-indigo-600 transition-all hover:shadow-md active:scale-95"><MessageSquare size={20}/></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};