import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DriverManagement } from './DriverManagement';
import { PackerManagement } from './PackerManagement';
import { mockService } from '../services/mockDataService';
import { CompleteProfileModal } from './CompleteProfileModal';
import { 
  User as UserIcon, Truck, Building, Mail, Shield, Users, 
  Plus, X, Briefcase, LayoutTemplate, RefreshCw, ToggleLeft, 
  ToggleRight, CheckCircle, AlertTriangle, Smartphone, BellRing,
  // Fix line 241: Added Phone import from lucide-react
  Phone
} from 'lucide-react';

interface SettingsProps {
  user: User;
  onRefreshUser?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onRefreshUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'employees' | 'partners'>('profile');
  const [teamSubTab, setTeamSubTab] = useState<'drivers' | 'packers'>('drivers');
  const [employees, setEmployees] = useState<User[]>([]);
  const [partners, setPartners] = useState<User[]>([]); // Wholesalers & Farmers
  
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<User>>({ name: '', email: '', role: UserRole.PZ_REP });

  // SMS Preference State
  const [smsEnabled, setSmsEnabled] = useState(user.smsNotificationsEnabled || false);
  const [smsPhone, setSmsPhone] = useState(user.phone || '');

  useEffect(() => {
      if (user.role === UserRole.ADMIN) {
          setEmployees(mockService.getPzRepresentatives());
          setPartners(mockService.getAllUsers().filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER));
      }
      setSmsEnabled(user.smsNotificationsEnabled || false);
      setSmsPhone(user.phone || '');
  }, [user, activeTab]);

  const handleAddEmployee = (e: React.FormEvent) => {
      e.preventDefault();
      if (newEmployee.name && newEmployee.email) {
          const newUser: User = {
              id: `emp-${Date.now()}`,
              name: newEmployee.name,
              email: newEmployee.email,
              role: UserRole.PZ_REP, // Default to rep
              businessName: 'Platform Zero'
          };
          mockService.addEmployee(newUser);
          setEmployees(mockService.getPzRepresentatives());
          setIsEmployeeModalOpen(false);
          setNewEmployee({ name: '', email: '', role: UserRole.PZ_REP });
          alert("Employee added successfully!");
      }
  };

  const handleSwitchToV1 = () => {
      if (confirm('Switch to Simplified Dashboard (Version 1)?')) {
          mockService.updateUserVersion(user.id, 'v1');
          if (onRefreshUser) onRefreshUser();
      }
  };

  const togglePartnerVersion = (partnerId: string, currentVersion: 'v1' | 'v2' | undefined) => {
      const newVersion = currentVersion === 'v2' ? 'v1' : 'v2';
      mockService.updateUserVersion(partnerId, newVersion);
      setPartners(mockService.getAllUsers().filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER));
  };

  const handleProfileComplete = () => {
      if(onRefreshUser) onRefreshUser();
  };

  const handleSaveSmsPreference = () => {
      mockService.updateUserSmsPreference(user.id, smsEnabled, smsPhone);
      alert("Notification preferences updated!");
      if(onRefreshUser) onRefreshUser();
  };

  const isProfileComplete = user.businessProfile?.isComplete;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Account Settings</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap py-4 px-1 border-b-4 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <UserIcon size={14} strokeWidth={3} />
            My Identity
          </button>

          {user.role === UserRole.WHOLESALER && (
            <button
              onClick={() => setActiveTab('team')}
              className={`whitespace-nowrap py-4 px-1 border-b-4 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${
                activeTab === 'team'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <Truck size={14} strokeWidth={3} />
              Fleet & Crew
            </button>
          )}

          {user.role === UserRole.ADMIN && (
            <>
                <button
                onClick={() => setActiveTab('partners')}
                className={`whitespace-nowrap py-4 px-1 border-b-4 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${
                    activeTab === 'partners'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
                >
                <Briefcase size={14} strokeWidth={3} />
                Partner Network
                </button>
                <button
                onClick={() => setActiveTab('employees')}
                className={`whitespace-nowrap py-4 px-1 border-b-4 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${
                    activeTab === 'employees'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
                >
                <Users size={14} strokeWidth={3} />
                PZ Reps
                </button>
            </>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* ALERT IF PROFILE INCOMPLETE */}
            {!isProfileComplete && (user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) && (
                <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-8 flex items-center gap-6 shadow-sm">
                    <div className="bg-red-100 p-4 rounded-2xl">
                        <AlertTriangle className="text-red-600" size={32}/>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-black text-red-900 uppercase tracking-tight text-lg">Action Required: Trade Profile Incomplete</h4>
                        <p className="text-sm text-red-700 font-medium">You must complete your business onboarding documents before you can transact on the marketplace.</p>
                    </div>
                    <button 
                        onClick={() => setIsProfileModalOpen(true)}
                        className="px-8 py-3 bg-red-600 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl transition-all whitespace-nowrap"
                    >
                        Complete Setup
                    </button>
                </div>
            )}

            <div className="bg-white shadow-sm rounded-[2.5rem] overflow-hidden border border-gray-100 p-10">
                <div className="flex items-center gap-8 mb-10">
                    <div className="h-24 w-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 font-black text-4xl shadow-inner-sm border border-indigo-100/50">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">{user.name}</h2>
                        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mt-2">{user.role}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Identity</label>
                        <div className="flex items-center gap-4 text-gray-900 bg-gray-50 p-5 rounded-2xl border border-gray-100 font-black uppercase text-sm">
                            <Building size={20} className="text-gray-300"/>
                            {user.businessName}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Email</label>
                        <div className="flex items-center gap-4 text-gray-900 bg-gray-50 p-5 rounded-2xl border border-gray-100 font-black text-sm">
                            <Mail size={20} className="text-gray-300"/>
                            {user.email}
                        </div>
                    </div>
                </div>
                
                <div className="pt-8 border-t border-gray-50 flex justify-end">
                    <button 
                        onClick={() => setIsProfileModalOpen(true)}
                        className="px-10 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 font-black text-[10px] uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                    >
                        Modify Identity
                    </button>
                </div>
            </div>

            {/* COMMUNICATION PREFERENCES (New Feature) */}
            <div className="bg-white shadow-sm rounded-[2.5rem] overflow-hidden border border-gray-100 p-10 space-y-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <BellRing size={24}/>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Notification Preferences</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Order status & logistics alerts</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl shadow-sm transition-all ${smsEnabled ? 'bg-emerald-600 text-white' : 'bg-white text-gray-300 border border-gray-100'}`}>
                                <Smartphone size={24}/>
                            </div>
                            <div>
                                <p className="font-black text-gray-900 uppercase text-sm">SMS Order Updates</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Get notified on delivery arrival & confirmation</p>
                            </div>
                        </div>
                        <button onClick={() => setSmsEnabled(!smsEnabled)} className="transition-all active:scale-90">
                            {smsEnabled ? <ToggleRight size={48} className="text-emerald-500 fill-current"/> : <ToggleLeft size={48} className="text-gray-200"/>}
                        </button>
                    </div>

                    {smsEnabled && (
                        <div className="p-8 bg-indigo-50/30 rounded-[2rem] border border-indigo-100 animate-in slide-in-from-top-2 duration-300">
                            <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 ml-1">Verified Mobile Number</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    {/* Added missing Phone icon to imports */}
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300"/>
                                    <input 
                                        type="tel" 
                                        placeholder="0400 000 000"
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-indigo-100 rounded-2xl font-black text-indigo-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        value={smsPhone}
                                        onChange={(e) => setSmsPhone(e.target.value)}
                                    />
                                </div>
                                <button 
                                    onClick={handleSaveSmsPreference}
                                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                                >
                                    Verify
                                </button>
                            </div>
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                                <Info size={12}/> Carrier rates may apply for standard SMS notifications.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* DASHBOARD VERSION TOGGLE (For Partners) */}
            {(user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER) && (
                <div className="bg-[#0B1221] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 transform rotate-12 scale-150 group-hover:rotate-0 transition-transform duration-700"><LayoutTemplate size={120}/></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase">
                                <LayoutTemplate className="text-emerald-400" size={28}/> Dashboard Mode
                            </h3>
                            <p className="text-slate-400 text-sm font-medium mt-2 max-w-md">
                                You are currently using the <span className="text-white font-black">Advanced (v2)</span> interface. Switch to Simplified for high-speed mobile operations.
                            </p>
                        </div>
                        <button 
                            onClick={handleSwitchToV1}
                            className="w-full md:w-auto px-10 py-5 bg-white text-[#0B1221] font-black rounded-2xl shadow-xl hover:bg-emerald-400 transition-all active:scale-95 text-[10px] uppercase tracking-[0.2em]"
                        >
                            Switch to Simplified (v1)
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}

        {activeTab === 'team' && user.role === UserRole.WHOLESALER && (
          <div className="space-y-6">
              <div className="flex gap-4 border-b border-gray-200 pb-1">
                  <button 
                      onClick={() => setTeamSubTab('drivers')}
                      className={`pb-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all border-b-4 ${teamSubTab === 'drivers' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                      Distribution Fleet
                  </button>
                  <button 
                      onClick={() => setTeamSubTab('packers')}
                      className={`pb-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all border-b-4 ${teamSubTab === 'packers' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                      Warehouse Crew
                  </button>
              </div>
              
              {teamSubTab === 'drivers' ? (
                  <DriverManagement user={user} />
              ) : (
                  <PackerManagement user={user} />
              )}
          </div>
        )}

        {activeTab === 'partners' && user.role === UserRole.ADMIN && (
            <div className="space-y-8">
                <div className="flex justify-between items-center px-1">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Partner Accounts</h2>
                        <p className="text-gray-500 font-medium">Managing dashboard overrides and verification status.</p>
                    </div>
                </div>

                <div className="bg-white shadow-sm border border-gray-100 rounded-[2.5rem] overflow-hidden">
                    <div className="grid grid-cols-1 divide-y divide-gray-100">
                        {partners.map(p => (
                            <div key={p.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner-sm border ${
                                        p.role === UserRole.FARMER ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>
                                        {p.businessName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900 text-lg uppercase tracking-tight flex items-center gap-3">
                                            {p.businessName}
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                p.role === UserRole.FARMER ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                                            }`}>
                                                {p.role}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{p.name} • {p.email}</div>
                                        <div className="mt-2 flex items-center gap-2">
                                            {p.businessProfile?.isComplete ? (
                                                <span className="text-emerald-600 font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5"><CheckCircle size={14}/> Verified Profile</span>
                                            ) : (
                                                <span className="text-red-500 font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5"><AlertTriangle size={14}/> Incomplete Identity</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10">
                                    <div className="text-right hidden lg:block">
                                        <div className="text-[9px] text-gray-300 font-black uppercase tracking-widest">Interface Status</div>
                                        <div className="font-black text-gray-900 text-sm uppercase tracking-tight mt-1">
                                            {p.dashboardVersion === 'v2' ? 'Advanced (v2)' : 'Classic (v1)'}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => togglePartnerVersion(p.id, p.dashboardVersion)}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                                            p.dashboardVersion === 'v2' 
                                            ? 'bg-[#0F172A] text-white hover:bg-black' 
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                                        }`}
                                    >
                                        <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500"/>
                                        Override to {p.dashboardVersion === 'v2' ? 'v1' : 'v2'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'employees' && user.role === UserRole.ADMIN && (
            <div className="space-y-8">
                <div className="flex justify-between items-center px-1">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Platform Representatives</h2>
                        <p className="text-gray-500 font-medium">Manage HQ agents for sales, support and success.</p>
                    </div>
                    <button 
                        onClick={() => setIsEmployeeModalOpen(true)}
                        className="px-8 py-3 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Plus size={18} strokeWidth={3}/> Add Agent
                    </button>
                </div>

                <div className="bg-white shadow-sm border border-gray-100 rounded-[2.5rem] overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {employees.map(emp => (
                            <div key={emp.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl shadow-inner-sm border border-indigo-100/50">
                                        {emp.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900 text-lg uppercase tracking-tight">{emp.name}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{emp.email}</div>
                                    </div>
                                </div>
                                <span className="px-5 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-inner-sm">
                                    Market Success Rep
                                </span>
                            </div>
                        ))}
                        {employees.length === 0 && (
                            <div className="p-20 text-center text-gray-300">
                                <Users size={48} className="mx-auto mb-4 opacity-10"/>
                                <p className="text-xs font-black uppercase tracking-widest">No agents provisioned</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Employee Modal */}
                {isEmployeeModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md p-4">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Provision Agent</h2>
                                <button onClick={() => setIsEmployeeModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 bg-white rounded-full border border-gray-100 shadow-sm"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleAddEmployee} className="p-10 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors"/>
                                        <input 
                                            required 
                                            type="text" 
                                            value={newEmployee.name} 
                                            onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none font-bold text-gray-900 transition-all" 
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Corporate Email</label>
                                    <div className="relative group">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors"/>
                                        <input 
                                            required 
                                            type="email" 
                                            value={newEmployee.email} 
                                            onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none font-bold text-gray-900 transition-all" 
                                            placeholder="jane@platformzero.io"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Restricted Role</label>
                                    <div className="relative group">
                                        <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"/>
                                        <select 
                                            className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl bg-gray-100 font-bold text-gray-400 cursor-not-allowed appearance-none"
                                            disabled
                                        >
                                            <option>Platform Representative</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-6 flex gap-3">
                                    <button type="button" onClick={() => setIsEmployeeModalOpen(false)} className="flex-1 py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                                    <button type="submit" className="flex-[2] py-4 bg-[#043003] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all">Provision Account</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Complete Profile Modal */}
      <CompleteProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onComplete={handleProfileComplete}
      />
    </div>
  );
};

const Info = ({ size = 24, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);
