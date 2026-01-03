
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SupplierPriceRequest, User, Customer } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  Handshake, Store, CheckCircle, ChevronRight, X, MessageSquare, 
  Clock, AlertCircle, Rocket, MapPin, DollarSign, ArrowLeft, Percent, TrendingUp, Check,
  // Add BrainCircuit and Package to the imports
  Search, Filter, Info, Gavel, FileSearch, ArrowUpRight, BrainCircuit, Package
} from 'lucide-react';
import { ChatDialog } from './ChatDialog';

export const AdminPriceRequests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'REVIEW' | 'PIPELINE'>('REVIEW');
  const [activeRequests, setActiveRequests] = useState<SupplierPriceRequest[]>([]);
  const [wholesalers, setWholesalers] = useState<User[]>([]);
  const [viewingRequest, setViewingRequest] = useState<SupplierPriceRequest | null>(null);
  const [newlyCreatedCustomer, setNewlyCreatedCustomer] = useState<Customer | null>(null);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatSupplierName, setChatSupplierName] = useState('');
  const [chatQuoteContext, setChatQuoteContext] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    const allRequests = mockService.getAllSupplierPriceRequests();
    setActiveRequests(allRequests);
    setWholesalers(mockService.getWholesalers());
  };

  const handleOpenSupplierChat = (req: SupplierPriceRequest) => {
    const supplier = wholesalers.find(w => w.id === req.supplierId);
    setChatSupplierName(supplier?.businessName || 'Supplier');
    setChatQuoteContext(`Quote ID: #${req.id.split('-').pop()}. Lead: ${req.customerContext}. Proposed items: ${req.items.map(i => i.productName).join(', ')}.`);
    setIsChatOpen(true);
  };

  const handleDealWon = (reqId: string) => {
    const newCustomer = mockService.finalizeDeal(reqId);
    refreshData();
    setViewingRequest(null);
    if (newCustomer) {
      setNewlyCreatedCustomer(newCustomer);
    }
  };

  const handleGetStarted = (customerId: string) => {
    mockService.sendOnboardingComms(customerId);
    alert("Onboarding Link dispatched via SMS and Email to the customer!");
    setNewlyCreatedCustomer(null);
    navigate('/consumer-onboarding');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'SUBMITTED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'WON': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'LOST': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const pipelineItems = activeRequests.filter(r => r.status === 'PENDING');
  const reviewNegotiations = activeRequests.filter(r => r.status === 'SUBMITTED');
  
  const displayedRequests = activeTab === 'PIPELINE' ? pipelineItems : reviewNegotiations;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-end px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Market Negotiations</h1>
          <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-widest">Pricing Audits & Partner Matching</p>
        </div>
        <button 
            onClick={() => navigate('/pricing-requests')}
            className="px-8 py-4 bg-[#043003] text-white rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95"
        >
            + Initiate Price Audit
        </button>
      </div>

      {newlyCreatedCustomer && (
        <div className="bg-[#043003] text-white p-10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-emerald-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform rotate-12 scale-150"><Rocket size={200}/></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="bg-emerald-500/20 p-5 rounded-3xl border border-white/10 shadow-inner-sm">
              <CheckCircle size={40} className="text-emerald-400"/>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight uppercase leading-none mb-2">Deal Finalized: {newlyCreatedCustomer.businessName}</h2>
              <p className="text-emerald-400/80 font-bold uppercase text-xs tracking-widest">Account Successfully mapped to {newlyCreatedCustomer.connectedSupplierName}</p>
            </div>
          </div>
          <button 
            onClick={() => handleGetStarted(newlyCreatedCustomer.id)}
            className="relative z-10 bg-white text-[#043003] px-14 py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-xs shadow-2xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 whitespace-nowrap active:scale-95"
          >
            Dispatch Onboarding <ArrowUpRight size={18}/>
          </button>
        </div>
      )}

      {/* Sub-Category Navigation */}
      <div className="bg-gray-100/50 p-2 rounded-[2.25rem] inline-flex border border-gray-200 shadow-inner-sm mx-2">
        <button 
            onClick={() => setActiveTab('REVIEW')}
            className={`px-12 py-5 rounded-[1.75rem] text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'REVIEW' ? 'bg-white text-indigo-700 shadow-xl ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Gavel size={18}/> Negotiations {reviewNegotiations.length > 0 && <span className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black animate-in zoom-in">{reviewNegotiations.length}</span>}
        </button>
        <button 
            onClick={() => setActiveTab('PIPELINE')}
            className={`px-12 py-5 rounded-[1.75rem] text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'PIPELINE' ? 'bg-white text-gray-900 shadow-xl ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Clock size={18}/> Pending Leads {pipelineItems.length > 0 && <span className="bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black animate-in zoom-in">{pipelineItems.length}</span>}
        </button>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px] relative">
        <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-white ${activeTab === 'PIPELINE' ? 'bg-orange-500' : 'bg-indigo-600'}`}>
                    {activeTab === 'PIPELINE' ? <Clock size={28}/> : <Handshake size={28}/>}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-2xl tracking-tighter uppercase leading-none">
                      {activeTab === 'PIPELINE' ? 'Awaiting Supplier Response' : 'Review Incoming Quotes'}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                    <AlertCircle size={12}/> Verified wholesale leads in negotiation phase
                  </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative group hidden lg:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                    <input placeholder="Filter by lead..." className="pl-11 pr-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-50/10 shadow-sm"/>
                </div>
                <button className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-indigo-600 shadow-sm transition-all"><Filter size={20}/></button>
            </div>
        </div>

        {displayedRequests.length === 0 ? (
            <div className="p-40 text-center animate-in fade-in duration-700">
                <div className="w-28 h-28 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border-2 border-dashed border-gray-200">
                    <Handshake size={56} className="text-gray-200" />
                </div>
                <h4 className="text-2xl font-black text-gray-300 uppercase tracking-tighter">Queue Empty</h4>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.2em] mt-3">No active items in {activeTab.toLowerCase()} status</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-10 gap-10">
                {displayedRequests.map(req => {
                    const supplier = wholesalers.find(w => w.id === req.supplierId);
                    const isNegotiated = req.status === 'SUBMITTED';

                    return (
                        <div 
                            key={req.id} 
                            onClick={() => setViewingRequest(req)}
                            className={`border-4 rounded-[3rem] p-10 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between h-[420px] bg-white ${isNegotiated ? 'border-indigo-100 hover:border-indigo-400' : 'border-gray-50 hover:border-orange-200'} animate-in zoom-in-95 duration-300`}
                        >
                            {isNegotiated && (
                                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-[2rem] shadow-xl animate-in slide-in-from-right-4">
                                    Action Item
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between items-start mb-10">
                                    <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border-2 shadow-inner-sm ${getStatusColor(req.status)}`}>
                                        {req.status === 'SUBMITTED' ? 'Review Quote' : 'Sent to Partner'}
                                    </span>
                                    <p className="text-[10px] text-gray-300 font-black font-mono mt-2 tracking-widest">AUDIT_ID: {req.id.split('-').pop()}</p>
                                </div>
                                <h4 className="font-black text-gray-900 text-3xl leading-none mb-4 tracking-tighter uppercase group-hover:text-indigo-600 transition-colors">{req.customerContext}</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-[1.5rem] border border-gray-100 group-hover:bg-white group-hover:border-indigo-100 transition-all">
                                        <Store size={20} className="text-indigo-400 shrink-0"/>
                                        <p className="text-sm font-black text-gray-900 uppercase truncate">{supplier?.businessName}</p>
                                    </div>
                                    <div className="flex items-center gap-4 px-4">
                                        <MapPin size={18} className="text-gray-300 shrink-0"/>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{req.customerLocation}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-10 border-t border-gray-50 group-hover:border-indigo-50">
                                <div className={`flex items-center gap-2.5 font-black text-[10px] uppercase tracking-widest ${isNegotiated ? 'text-indigo-600' : 'text-gray-400'}`}>
                                    {isNegotiated ? <CheckCircle size={18}/> : <Clock size={18}/>}
                                    {isNegotiated ? 'Response Locked' : 'Sourcing in Progress'}
                                </div>
                                <div className="bg-gray-100 p-3 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                    <ChevronRight size={22} strokeWidth={3}/>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* VIEW QUOTE DETAILS MODAL */}
      {viewingRequest && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md p-4">
              <div className="bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border-4 border-white/20">
                  <div className="p-12 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-gray-50/50 relative">
                      <div className="absolute top-0 right-20 p-8 opacity-[0.03] pointer-events-none transform -rotate-12"><FileSearch size={200}/></div>
                      <div className="relative z-10">
                          <div className="flex flex-wrap items-center gap-4 mb-3">
                             <h2 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">{viewingRequest.customerContext}</h2>
                             <div className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] border-2 shadow-xl ${getStatusColor(viewingRequest.status)}`}>
                                 {viewingRequest.status === 'SUBMITTED' ? 'Negotiation Ready' : 'Lead Assignment Active'}
                             </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                             <span className="text-xs text-indigo-600 font-black uppercase tracking-[0.25em]">Wholesaler: {wholesalers.find(w => w.id === viewingRequest.supplierId)?.businessName}</span>
                             <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{viewingRequest.customerLocation}</span>
                          </div>
                      </div>
                      <button onClick={() => setViewingRequest(null)} className="text-gray-300 hover:text-gray-900 p-3 bg-white rounded-full shadow-lg border border-gray-100 transition-all active:scale-90 hover:rotate-90 duration-300"><X size={32}/></button>
                  </div>
                  
                  <div className="p-12 overflow-y-auto flex-1 custom-scrollbar bg-white">
                      <div className="bg-[#EEF2FF] rounded-[2rem] p-8 border border-indigo-100 mb-12 flex items-start gap-6 relative overflow-hidden group">
                        {/* Fix: Added missing BrainCircuit import to lucide-react imports */}
                        <div className="absolute top-0 right-0 p-6 opacity-5 transform rotate-45 scale-150 group-hover:rotate-0 transition-transform duration-1000"><BrainCircuit size={140}/></div>
                        <div className="bg-white p-4 rounded-2xl shadow-xl border border-indigo-50 text-indigo-600 shrink-0 relative z-10">
                            <Info size={32} strokeWidth={2.5} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-black text-[#1E1B4B] uppercase tracking-widest mb-1">Administrator Review Protocol</p>
                            <p className="text-base text-[#4338CA] font-medium leading-relaxed max-w-3xl">This wholesaler has responded to the target price floor. Review individual line item variance below. <span className="font-black">Matches</span> indicate the partner can fulfill at or below our target market efficiency rate.</p>
                        </div>
                      </div>

                      <div className="overflow-hidden border border-gray-100 rounded-[2.5rem] shadow-sm">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50/80 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] border-b border-gray-100">
                              <tr>
                                  <th className="py-8 px-10">Line Item Details</th>
                                  <th className="py-8 px-10 text-right">PZ Target Price</th>
                                  <th className="py-8 px-10 text-center">Wholesaler Match</th>
                                  <th className="py-8 px-10 text-right text-indigo-700">Partner Offer</th>
                                  <th className="py-8 px-10 text-right">Margin Delta</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                              {viewingRequest.items.map((item, idx) => {
                                  const variance = item.offeredPrice ? ((item.offeredPrice - item.targetPrice) / item.targetPrice) * 100 : 0;
                                  return (
                                      <tr key={idx} className="hover:bg-gray-50/50 transition-all group">
                                          <td className="py-10 px-10">
                                            <div className="font-black text-gray-900 text-2xl tracking-tighter uppercase leading-none mb-2 group-hover:text-indigo-600 transition-colors">{item.productName}</div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                {/* Fix: Added missing Package import to lucide-react imports */}
                                                <Package size={14}/> Weekly Consumption: {item.qty} units
                                            </div>
                                          </td>
                                          <td className="py-10 px-10 text-right">
                                            <div className="font-black text-gray-400 text-2xl tracking-tighter">${item.targetPrice.toFixed(2)}</div>
                                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Base Target</span>
                                          </td>
                                          <td className="py-10 px-10 text-center">
                                              {viewingRequest.status === 'PENDING' ? (
                                                  <span className="text-gray-200 italic font-black uppercase text-[10px]">Pending</span>
                                              ) : item.isMatchingTarget ? (
                                                  <div className="bg-emerald-500 text-white w-14 h-14 rounded-[1.25rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-100 animate-in zoom-in duration-500 border-2 border-white"><Check size={32} strokeWidth={4}/></div>
                                              ) : (
                                                  <div className="bg-red-50 text-red-500 w-14 h-14 rounded-[1.25rem] flex items-center justify-center mx-auto font-black text-[10px] uppercase border-2 border-red-100 shadow-sm transition-transform group-hover:scale-95">NO MATCH</div>
                                              )}
                                          </td>
                                          <td className="py-10 px-10 text-right">
                                              {item.offeredPrice ? (
                                                <div className="space-y-1">
                                                    <div className="font-black text-indigo-700 text-4xl tracking-tighter animate-in fade-in slide-in-from-bottom-2">${item.offeredPrice.toFixed(2)}</div>
                                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Proposed Rate</p>
                                                </div>
                                              ) : (
                                                <div className="flex items-center justify-end gap-2 text-gray-200 animate-pulse"><Clock size={20}/> <span className="font-black text-xl uppercase tracking-widest">Sourcing</span></div>
                                              )}
                                          </td>
                                          <td className="py-10 px-10 text-right">
                                              {item.offeredPrice ? (
                                                  <div className="flex flex-col items-end gap-1.5">
                                                      <span className={`text-[11px] font-black px-5 py-2 rounded-2xl uppercase tracking-widest border-2 shadow-sm transition-all ${variance <= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                                          {variance <= 0 ? 'OPTIMIZED' : `+${variance.toFixed(1)}% VAR`}
                                                      </span>
                                                      <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">Variance to Floor</p>
                                                  </div>
                                              ) : (
                                                  <span className="text-[10px] text-gray-200 font-black uppercase tracking-widest italic opacity-30">Waiting...</span>
                                              )}
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                        </table>
                      </div>
                  </div>

                  <div className="p-12 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-12 sticky bottom-0 z-20 shadow-[0_-30px_60px_rgba(0,0,0,0.05)] bg-white/95 backdrop-blur-md">
                      <div className="text-left">
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3">Total Estimated Negotiation Value</p>
                          <div className="flex items-baseline gap-3">
                             <p className="text-6xl font-black text-[#043003] tracking-tighter">
                                 ${viewingRequest.items.reduce((sum, i) => sum + (i.offeredPrice || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                             </p>
                             <span className="text-sm font-black text-gray-400 uppercase tracking-widest">/ Per Week</span>
                          </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                        <button 
                            onClick={() => handleOpenSupplierChat(viewingRequest)}
                            className="flex-1 sm:flex-none px-12 py-6 bg-white border-2 border-indigo-200 text-indigo-700 font-black text-[12px] uppercase tracking-[0.25em] rounded-2xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group"
                        >
                            <MessageSquare size={22} className="group-hover:rotate-12 transition-transform"/> Start Negotiation
                        </button>
                        
                        {viewingRequest.status === 'SUBMITTED' && (
                            <button 
                                onClick={() => handleDealWon(viewingRequest.id)}
                                className="flex-1 sm:flex-none px-16 py-6 bg-[#043003] text-white font-black text-[12px] uppercase tracking-[0.25em] rounded-2xl hover:bg-black shadow-[0_20px_40px_-10px_rgba(4,48,3,0.3)] transition-all flex items-center justify-center gap-4 hover:scale-[1.03] active:scale-95"
                            >
                                <CheckCircle size={24} strokeWidth={2.5}/> Finalize & Activate
                            </button>
                        )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      <ChatDialog 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        orderId="NEGOTIATION-ROOM"
        issueType={chatQuoteContext}
        repName={chatSupplierName}
      />
    </div>
  );
};
