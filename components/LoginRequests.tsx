
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationRequest, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { triggerNativeSms, generateProductDeepLink } from '../services/smsService';
/* Added Plus to imports from lucide-react */
import { 
  Check, X, Clock, UserPlus, Link as LinkIcon, Copy, Building, 
  User, Mail, Smartphone, CheckCircle, Calculator, FileText, 
  Calendar, Send, Trash2, ExternalLink, Plus
} from 'lucide-react';

export const LoginRequests: React.FC = () => {
    const [requests, setRequests] = useState<RegistrationRequest[]>([]);
    const [approvedLinks, setApprovedLinks] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    useEffect(() => {
        loadRequests();
        const interval = setInterval(loadRequests, 3000);
        return () => clearInterval(interval);
    }, []);

    const loadRequests = () => {
        setRequests(mockService.getRegistrationRequests());
    };

    const handleApprove = (req: RegistrationRequest) => {
        mockService.approveRegistration(req.id);
        // Generate a unique onboarding link for this user
        const setupLink = `${window.location.origin}/#/setup/${req.id.split('-').pop()}`;
        setApprovedLinks(prev => ({ ...prev, [req.id]: setupLink }));
        loadRequests();
    };

    const handleReject = (id: string) => {
        if (confirm("Are you sure you want to deny this request?")) {
            mockService.rejectRegistration(id);
            loadRequests();
        }
    };

    const handleGenerateQuote = (req: RegistrationRequest) => {
        navigate('/pricing-requests', { state: { req } });
    };

    const handleBookMeeting = (req: RegistrationRequest) => {
        const subject = encodeURIComponent(`Platform Zero Onboarding: ${req.businessName}`);
        const body = encodeURIComponent(`Hi ${req.name},\n\nThanks for applying to Platform Zero as a ${req.requestedRole}. We'd love to jump on a quick 15-minute call to walk you through the marketplace and finalize your setup.\n\nPlease book a time here: https://calendly.com/pz-onboarding\n\nBest regards,\nPZ Admin`);
        window.location.href = `mailto:${req.email}?subject=${subject}&body=${body}`;
    };

    const handleTextLink = (req: RegistrationRequest, link: string) => {
        const msg = `Hi ${req.name}! Your Platform Zero account for ${req.businessName} is approved. Complete your setup here: ${link}`;
        triggerNativeSms(req.consumerData?.mobile || '0400000000', msg);
    };

    const pending = requests.filter(r => r.status === 'Pending');

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Login Requests</h1>
                    <p className="text-gray-500 font-medium">Review new signups and provision network access.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                        <Clock size={24} className="text-orange-500"/> Incoming Applicants
                    </h2>
                    <span className="bg-white border border-gray-200 text-gray-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{pending.length} Waiting</span>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {pending.length === 0 ? (
                        <div className="p-32 text-center text-gray-400">
                            <CheckCircle size={64} className="mx-auto mb-6 opacity-10"/>
                            <p className="font-black uppercase tracking-[0.2em] text-xs">No pending applications</p>
                        </div>
                    ) : (
                        pending.map(req => (
                            <div key={req.id} className="p-8 hover:bg-gray-50/30 transition-colors">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex gap-6">
                                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-inner-sm shrink-0 ${
                                            req.requestedRole === UserRole.FARMER ? 'bg-emerald-100 text-emerald-700' : 
                                            req.requestedRole === UserRole.WHOLESALER ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                                        }`}>
                                            {req.businessName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-black text-gray-900 text-xl tracking-tight uppercase">{req.businessName}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                    req.requestedRole === UserRole.FARMER ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                    {req.requestedRole}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-6 text-[10px] text-gray-400 font-black uppercase tracking-tight mt-2">
                                                <span className="flex items-center gap-2"><User size={14} className="text-gray-300"/> {req.name}</span>
                                                <span className="flex items-center gap-2"><Mail size={14} className="text-gray-300"/> {req.email}</span>
                                                <span className="flex items-center gap-2 text-indigo-500"><Smartphone size={14}/> {req.consumerData?.mobile || '04xx xxx xxx'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        {approvedLinks[req.id] ? (
                                            <div className="flex items-center gap-2 animate-in zoom-in-95">
                                                <div className="bg-gray-100 border border-gray-200 px-4 py-3 rounded-xl flex items-center gap-3">
                                                    <LinkIcon size={14} className="text-indigo-600"/>
                                                    <span className="text-[10px] font-mono font-black text-gray-500 truncate max-w-[120px]">{approvedLinks[req.id]}</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleTextLink(req, approvedLinks[req.id])}
                                                    className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                                                >
                                                    <Smartphone size={18}/>
                                                    <span className="text-[10px] font-black uppercase">Text Link</span>
                                                </button>
                                                <button 
                                                    onClick={() => { delete approvedLinks[req.id]; setApprovedLinks({...approvedLinks}); }}
                                                    className="p-3 text-gray-300 hover:text-gray-600"
                                                >
                                                    <X size={20}/>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {req.consumerData?.invoiceFile && (
                                                    <button 
                                                        onClick={() => handleGenerateQuote(req)}
                                                        className="px-6 py-3.5 bg-indigo-50 text-indigo-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-2 shadow-sm border border-indigo-100"
                                                    >
                                                        <Calculator size={16}/> Build Quote
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleBookMeeting(req)}
                                                    className="px-6 py-3.5 bg-white border-2 border-indigo-100 text-indigo-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-sm"
                                                >
                                                    <Calendar size={16}/> Book Meeting
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(req.id)}
                                                    className="px-6 py-3.5 bg-white border-2 border-red-50 text-red-400 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
                                                >
                                                    Deny
                                                </button>
                                                <button 
                                                    onClick={() => handleApprove(req)}
                                                    className="px-8 py-3.5 bg-emerald-600 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.15em] hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center gap-2 active:scale-95"
                                                >
                                                    <CheckCircle size={18}/> Approve Trade
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] transform rotate-12 group-hover:scale-110 transition-transform pointer-events-none">
                    <UserPlus size={180}/>
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-2">Need to manual invite?</h3>
                    <p className="text-gray-500 font-medium max-w-md">Instantly provision a profile and generate a setup link without waiting for an application.</p>
                </div>
                <button 
                    onClick={() => navigate('/consumer-onboarding')}
                    className="relative z-10 px-10 py-5 bg-[#0F172A] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                    <Plus size={20}/> Manual Provision
                </button>
            </div>
        </div>
    );
};
