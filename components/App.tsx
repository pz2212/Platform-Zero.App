
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { UserRole, User, AppNotification, RegistrationRequest } from '../types';
import { mockService } from '../services/mockDataService';
import { emailService } from '../services/emailService';
import { Dashboard } from './Dashboard';
import { FarmerDashboard } from './FarmerDashboard';
import { ConsumerDashboard } from './ConsumerDashboard';
import { GrocerDashboard } from './GrocerDashboard';
import { GrocerMarketplace } from './GrocerMarketplace';
import { ProductPricing } from './ProductPricing';
import { Marketplace } from './Marketplace';
import { SupplierMarket } from './SupplierMarket';
import { AdminDashboard } from './AdminDashboard';
import { AdminAccounts } from './AdminAccounts';
import { Settings as SettingsComponent } from './Settings';
import { LoginRequests } from './LoginRequests';
import { ConsumerOnboarding } from './ConsumerOnboarding';
import { CustomerPortals } from './CustomerPortals';
import { Accounts } from './Accounts';
import { PricingRequests } from './PricingRequests';
import { AdminPriceRequests } from './AdminPriceRequests';
import { ConsumerLanding } from './ConsumerLanding';
import { CustomerOrders } from './CustomerOrders'; 
import { AdminRepManagement } from './AdminRepManagement';
import { AdminSuppliers } from './AdminSuppliers';
import { TradingInsights } from './TradingInsights';
import { Contacts } from './Contacts';
import { Notifications } from './Notifications';
import { LiveActivity } from './LiveActivity';
import { Inventory } from './Inventory';
import { SharedProductLanding } from './SharedProductLanding';
import { EnvironmentalImpact } from './EnvironmentalImpact';
import { AdminMarketOps } from './AdminMarketOps';
import { 
  LayoutDashboard, ShoppingCart, Users, Settings, LogOut, Tags, ChevronDown, UserPlus, 
  DollarSign, X, Lock, ArrowLeft, Bell, 
  ShoppingBag, ShieldCheck, TrendingUp, Target, Plus, ChevronUp, Layers, 
  Sparkles, User as UserIcon, Building, ChevronRight,
  Sprout, Globe, Users2, Circle, LogIn, ArrowRight, Menu, Search, Calculator, BarChart3,
  Wallet, FileText, CreditCard, Activity, Briefcase, Store, TrendingDown, Gavel, Leaf, BarChart4, Loader2, Mail,
  Key
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
  const [isConfirmingEmail, setIsConfirm