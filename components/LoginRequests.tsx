
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationRequest, UserRole } from '../types';
import { mockService } from '../services/mockDataService';
import { triggerNativeSms } from '../services/smsService';
import { ManualInviteModal } from './ManualInviteModal';
import { 
  Check, X, Clock, UserPlus, Link as LinkIcon, Copy, Building, 
  User, Mail, Smartphone, CheckCircle, Calculator, FileText, 
  Calendar, Send, Trash2, ExternalLink, Plus, ShieldCheck
} from 'lucide-react';

export const LoginRequests: React.FC = () => {
    const [requests, setRequests] = useState<RegistrationRequest[]>([]);
    const [isManualInviteOpen, setIsManualInviteOpen] = useState(false);
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
        loadRequests();
        alert(`Application for ${req.businessName} approved! An access code has been generated.`);
    };

    const handleReject = (id: string) => {
        if (confirm("Are you sure you want to deny this request?")) {
            mockService.rejectRegistration(id);
            loadRequests();
        }
    };

    const handleSendCodeSms = (req: RegistrationRequest) => {
        const msg = `Hi ${req.firstName}! Your Platform Zero account for ${req.businessName} is approved. Log in using your email and code: ${req.temporaryCode}`;
        triggerNativeSms(req.mobile, msg);
    };

    const pending = requests.filter(r => r.status === 'Pending');
    const approved = requests.filter(r => r.status === 'Approved');

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Access Control</h1>
                    <p className="text-gray-500 font-medium">Review signup applications and dispatch access codes.</p>
                </div>
                <button 
                    onClick={() => setIsManualInviteOpen(true)}
                    className="px-8 py-3 bg-[#043003] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={18}/> Manual Provision
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                        <Clock size={24} className="text-orange-500"/> Pending Applications
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
                                                <span className="flex items-center gap-2"><User size={14} className="text-gray-300"/> {req.firstName} {req.lastName}</span>
                                                <span className="flex items-center gap-2"><Mail size={14} className="text-gray-300"/> {req.email}</span>
                                                <span className="flex items-center gap-2 text-indigo-500"><Smartphone size={14}/> {req.mobile}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <button 
                                            onClick={() => handleReject(req.id)}
                                            className="px-6 py-3 bg-white border-2 border-red-50 text-red-400 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
                                        >
                                            Reject
                                        </button>
                                        <button 
                                            onClick={() => handleApprove(req)}
                                            className="px-8 py-3 bg-emerald-600 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.15em] hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center gap-2 active:scale-95"
                                        >
                                            <CheckCircle size={18}/> Approve & Generate Code
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Approved List with Codes */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-emerald-50/20 flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-emerald-500"/> Approved Directory
                    </h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {approved.length === 0 ? (
                        <div className="p-20 text-center text-gray-400">
                            <p className="font-black uppercase tracking-[0.2em] text-[10px]">No approved accounts yet</p>
                        </div>
                    ) : (
                        approved.map(req => (
                            <div key={req.id} className="p-8 hover:bg-gray-50/30 transition-colors">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center font-black text-emerald-600 border border-emerald-100">
                                            {req.businessName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 uppercase text-sm">{req.businessName}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{req.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-center">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Access Code</p>
                                            <span className="font-mono font-black text-lg text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-xl border border-indigo-100">{req.temporaryCode}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleSendCodeSms(req)}
                                            className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                            title="Dispatch code via SMS"
                                        >
                                            <Smartphone size={18}/>
                                            <span className="text-[9px] font-black uppercase">Send SMS</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <ManualInviteModal isOpen={isManualInviteOpen} onClose={() => setIsManualInviteOpen(false)} />
        </div>
    );
};

const CheckCircle2 = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);
