import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { UserRole, User, AppNotification, RegistrationRequest } from './types';
import { mockService } from './services/mockDataService';
import { Dashboard } from './components/Dashboard';
import { FarmerDashboard } from './components/FarmerDashboard';
import { ConsumerDashboard } from './components/ConsumerDashboard';
import { GrocerDashboard } from './components/GrocerDashboard';
import { GrocerMarketplace } from './components/GrocerMarketplace';
import { ProductPricing } from './components/ProductPricing';
import { Marketplace } from './components/Marketplace';
import { SupplierMarket } from './components/SupplierMarket';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAccounts } from './components/AdminAccounts';
import { Settings as SettingsComponent } from './components/Settings';
import { LoginRequests } from './components/LoginRequests';
import { ConsumerOnboarding } from './components/ConsumerOnboarding';
import { CustomerPortals } from './components/CustomerPortals';
import { Accounts } from './components/Accounts';
import { PricingRequests } from './components/PricingRequests';
import { AdminPriceRequests } from './components/AdminPriceRequests';
import { ConsumerLanding } from './components/ConsumerLanding';
import { CustomerOrders } from './components/CustomerOrders'; 
import { AdminRepManagement } from './components/AdminRepManagement';
import { AdminSuppliers } from './components/AdminSuppliers';
import { TradingInsights } from './components/TradingInsights';
import { Contacts } from './components/Contacts';
import { Notifications } from './components/Notifications';
import { LiveActivity } from './components/LiveActivity';
import { Inventory } from './components/Inventory';
import { SharedProductLanding } from './components/SharedProductLanding';
import { EnvironmentalImpact } from './components/EnvironmentalImpact';
import { AdminMarketOps } from './components/AdminMarketOps';
import { 
  LayoutDashboard, ShoppingCart, Users, Settings, LogOut, Tags, ChevronDown, UserPlus, 
  DollarSign, X, Lock, ArrowLeft, Bell, 
  ShoppingBag, ShieldCheck, TrendingUp, Target, Plus, ChevronUp, Layers, 
  Sparkles, User as UserIcon, Building, ChevronRight,
  Sprout, Globe, Users2, Circle, LogIn, ArrowRight, Menu, Search, Calculator, BarChart3,
  Wallet, FileText, CreditCard, Activity, Briefcase, Store, TrendingDown, Gavel, Leaf, BarChart4
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active, onClick, badge = 0, isSubItem = false }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
      active 
        ? 'bg-emerald-50 text-[#043003] shadow-sm' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    } ${isSubItem ? 'ml-6 py-2' : ''}`}
  >
    <div className="flex items-center space-x-3 min-w-0">
        <Icon size={isSubItem ? 16 : 20} className={active ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500 transition-colors'} />
        <span className={`${isSubItem ? 'text-[13px]' : 'text-sm'} truncate font-bold tracking-tight uppercase`}>{label}</span>
    </div>
    {badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
            {badge}
        </span>
    )}
  </Link>
);

const AppLayout = ({ children, user, onLogout }: any) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCustomerActivityOpen, setIsCustomerActivityOpen] = useState(
    location.pathname === '/login-requests' || 
    location.pathname === '/customer-portal' || 
    location.pathname === '/consumer-onboarding'
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string, exact: boolean = false) => {
      if (exact) return location.pathname === path;
      return location.pathname.startsWith(path);
  };
  
  const isPartner = user.role === UserRole.WHOLESALER || user.role === UserRole.FARMER;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const NavContent = () => (
    <>
      {user.role === UserRole.ADMIN ? (
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">HQ Admin</p>
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/', true)} />
            <SidebarLink to="/live-ops" icon={BarChart4} label="Live Operations" active={isActive('/live-ops')} />
            
            <div className="pt-4 mt-4 border-t border-gray-50 space-y-1">
                <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Market Data</p>
                
                {/* Customer Activity Dropdown */}
                <div className="space-y-1">
                    <button 
                        onClick={() => setIsCustomerActivityOpen(!isCustomerActivityOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                            isActive('/login-requests') || isActive('/customer-portal') || isActive('/consumer-onboarding')
                            ? 'bg-emerald-50/50 text-[#043003]' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            <Activity size={20} className="text-gray-400" />
                            <span className="text-sm font-bold tracking-tight uppercase">Customer Activity</span>
                        </div>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isCustomerActivityOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isCustomerActivityOpen && (
                        <div className="space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
                            <SidebarLink to="/login-requests" icon={UserPlus} label="Login Requests" active={isActive('/login-requests')} isSubItem />
                            <SidebarLink to="/customer-portal" icon={Store} label="Customer Portal" active={isActive('/customer-portal')} isSubItem />
                            <SidebarLink to="/consumer-onboarding" icon={Users} label="Onboarding Feed" active={isActive('/consumer-onboarding')} isSubItem />
                        </div>
                    )}
                </div>
                <SidebarLink to="/impact" icon={Leaf} label="Impact Dashboard" active={isActive('/impact')} />
                <SidebarLink to="/admin-accounts" icon={Wallet} label="Global Ledger" active={isActive('/admin-accounts')} />
            </div>

            <div className="pt-4 mt-4 border-t border-gray-50">
                <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Leads</p>
                <SidebarLink to="/pricing-requests" icon={Calculator} label="Pricing Audits" active={isActive('/pricing-requests')} />
                <SidebarLink to="/negotiations" icon={Gavel} label="Negotiations" active={isActive('/negotiations')} />
            </div>

            <div className="pt-4 mt-4 border-t border-gray-50">
                <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Management</p>
                <SidebarLink to="/rep-management" icon={Briefcase} label="Rep Management" active={isActive('/rep-management')} />
                <SidebarLink to="/suppliers" icon={Store} label="Suppliers" active={isActive('/suppliers')} />
                <SidebarLink to="/marketplace" icon={Layers} label="Catalog Manager" active={isActive('/marketplace')} />
            </div>
          </div>
      ) : user.role === UserRole.CONSUMER ? (
        <div className="space-y-1">
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/', true)} />
            <SidebarLink to="/orders" icon={ShoppingCart} label="Track Orders" active={isActive('/orders')} />
            <SidebarLink to="/marketplace" icon={ShoppingBag} label="Fresh Catalog" active={isActive('/marketplace')} />
            <SidebarLink to="/accounts" icon={Wallet} label="Accounts & Billing" active={isActive('/accounts')} />
        </div>
      ) : user.role === UserRole.GROCERY ? (
        <div className="space-y-1">
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/', true)} />
            <SidebarLink to="/grocer/marketplace" icon={TrendingDown} label="Clearance Market" active={isActive('/grocer/marketplace')} />
            <SidebarLink to="/orders" icon={ShoppingCart} label="My Orders" active={isActive('/orders')} />
            <SidebarLink to="/accounts" icon={Wallet} label="Financials" active={isActive('/accounts')} />
        </div>
      ) : isPartner ? (
        <div className="space-y-1">
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/', true)} />
            <SidebarLink to="/contacts" icon={Users} label="Buyer Network" active={isActive('/contacts')} />
            <SidebarLink to="/pricing" icon={Tags} label="Inventory & Price" active={isActive('/pricing')} />
            <SidebarLink to="/accounts" icon={DollarSign} label="Financials" active={isActive('/accounts')} />
            <SidebarLink to="/market" icon={Globe} label="Supplier Market" active={isActive('/market')} />
        </div>
      ) : null}
    </>
  );
  
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed inset-y-0 z-30">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
          <span className="font-black text-xl tracking-tighter text-gray-900 uppercase">Platform Zero</span>
        </div>
        
        <div className="flex-1 px-4 space-y-8 flex flex-col no-scrollbar">
            <NavContent />
        </div>

        <div className="p-4 border-t border-gray-50 space-y-1">
            <SidebarLink to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-all uppercase">
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 w-full min-h-screen bg-[#F8FAFC]">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 md:px-8 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-4 flex-1">
              <div className="md:hidden w-8 h-8 bg-[#043003] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">P</div>
              <div className="hidden sm:flex items-center gap-4 flex-1">
                <div className="relative max-w-md w-full group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                  <input type="text" placeholder="Search HQ records..." className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"/>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 relative">
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-gray-900 leading-none mb-1 uppercase">{user.name}</p>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">{user.role}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black shadow-sm shrink-0">
                    {user.name.charAt(0)}
                  </div>
                </div>

                <div className="md:hidden ml-1" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 border-2 ${
                      isMobileMenuOpen 
                        ? 'bg-white border-[#043003] text-[#043003]' 
                        : 'bg-[#043003] border-[#043003] text-white shadow-emerald-900/10'
                    }`}
                  >
                    <Menu size={16} strokeWidth={2.5}/>
                    <span>NAVIGATE</span>
                    <ChevronDown size={12} strokeWidth={3} className={`transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`}/>
                  </button>

                  {isMobileMenuOpen && (
                    <div className="absolute right-0 top-14 w-[260px] bg-white rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100 py-4 px-3 z-[60] animate-in zoom-in-95 slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2 mb-4 border-b border-gray-50">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Account</p>
                            <p className="font-black text-gray-900 uppercase truncate text-xs">{user.businessName}</p>
                        </div>
                        
                        <div className="space-y-1">
                            <NavContent />
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                            <SidebarLink to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
                            <button onClick={onLogout} className="w-full flex items-center justify-between px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-xl text-sm font-black transition-all uppercase">
                                <div className="flex items-center gap-3">
                                  <LogOut size={20} />
                                  <span>Sign Out</span>
                                </div>
                                <ArrowRight size={14}/>
                            </button>
                        </div>
                    </div>
                  )}
                </div>
            </div>
        </header>
        <div className="flex-1 p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState<'category' | 'credentials'>('category');

  const handleAutoLogin = (email: string) => {
    const foundUser = mockService.getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) { setUser(foundUser); setShowAuthModal(false); } else { alert("Account not found."); }
  };

  const wrapLayout = (element: React.ReactElement) => (
    <Router>
        <Routes>
            <Route path="/l/:itemId" element={<SharedProductLanding user={user} onLogin={() => { setAuthStep('category'); setShowAuthModal(true); }} />} />
            <Route path="/*" element={
                user ? (
                    <AppLayout user={user} onLogout={() => setUser(null)}>
                        {element}
                    </AppLayout>
                ) : (
                    <>
                        <ConsumerLanding onLogin={() => { setAuthStep('category'); setShowAuthModal(true); }} />
                        <AuthModal 
                            isOpen={showAuthModal} 
                            onClose={() => setShowAuthModal(false)} 
                            step={authStep} 
                            setStep={setAuthStep} 
                            onLogin={(e: any) => {e.preventDefault();}} 
                            onAutoLogin={handleAutoLogin} 
                        />
                    </>
                )
            } />
        </Routes>
    </Router>
  );

  return wrapLayout(
    <Routes>
      <Route path="/" element={
        user?.role === UserRole.ADMIN ? <AdminDashboard /> : 
        user?.role === UserRole.CONSUMER ? <ConsumerDashboard user={user} /> : 
        user?.role === UserRole.GROCERY ? <GrocerDashboard user={user} /> :
        user ? <Dashboard user={user} /> : <Navigate to="/" />
      } />
      <Route path="/grocer/marketplace" element={user ? <GrocerMarketplace user={user} /> : <Navigate to="/" />} />
      <Route path="/login-requests" element={<LoginRequests />} />
      <Route path="/consumer-onboarding" element={<ConsumerOnboarding />} />
      <Route path="/customer-portal" element={<CustomerPortals />} />
      <Route path="/impact" element={<EnvironmentalImpact />} />
      <Route path="/live-ops" element={<AdminMarketOps />} />
      <Route path="/admin-accounts" element={user?.role === UserRole.ADMIN ? <AdminAccounts /> : <Navigate to="/" />} />
      <Route path="/pricing-requests" element={user ? <PricingRequests user={user} /> : <Navigate to="/" />} />
      <Route path="/negotiations" element={user ? <AdminPriceRequests /> : <Navigate to="/" />} />
      <Route path="/rep-management" element={<AdminRepManagement />} />
      <Route path="/suppliers" element={<AdminSuppliers />} />
      <Route path="/marketplace" element={user ? <Marketplace user={user} /> : <Navigate to="/" />} />
      <Route path="/market" element={user ? <SupplierMarket user={user} /> : <Navigate to="/" />} />
      <Route path="/pricing" element={user ? <ProductPricing user={user} /> : <Navigate to="/" />} />
      <Route path="/inventory" element={<Inventory items={mockService.getAllInventory()} />} />
      <Route path="/accounts" element={user ? <Accounts user={user} /> : <Navigate to="/" />} />
      <Route path="/settings" element={user ? <SettingsComponent user={user} /> : <Navigate to="/" />} />
      <Route path="/orders" element={user ? <CustomerOrders user={user} /> : <Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const AuthModal = ({ isOpen, onClose, step, setStep, onAutoLogin }: any) => {
    if (!isOpen) return null;
    const demoLogins = [
        { label: 'ADMIN HQ', email: 'admin@pz.com', color: 'bg-slate-50 border-slate-100 hover:bg-slate-100' },
        { label: 'WHOLESALER', email: 'sarah@fresh.com', color: 'bg-blue-50 border-blue-100 hover:bg-blue-100' },
        { label: 'FARMER', email: 'bob@greenvalley.com', color: 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100' },
        { label: 'BUYER (CAFÉ)', email: 'alice@cafe.com', color: 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100' },
        { label: 'BUYER (GROCERY)', email: 'gary@grocer.com', color: 'bg-orange-50 border-orange-100 hover:bg-orange-100' },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Portal Access</h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-all"><X size={28} /></button>
                </div>
                <div className="p-10 space-y-6">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Select Portal Mode</p>
                    <div className="grid grid-cols-1 gap-3">
                        {demoLogins.map(demo => (
                            <button 
                                key={demo.label} 
                                onClick={() => onAutoLogin(demo.email)} 
                                className={`flex items-center justify-between p-6 rounded-2xl border transition-all group ${demo.color}`}
                            >
                                <div className="text-left">
                                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{demo.label}</span>
                                    <span className="block text-xs text-gray-400 font-medium">{demo.email}</span>
                                </div>
                                <ArrowRight size={20} className="text-gray-300 group-hover:text-gray-900 transition-all group-hover:translate-x-1"/>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
