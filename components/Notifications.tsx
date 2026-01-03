import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCircle2, ShoppingCart, Calculator, 
  UserPlus, Sparkles, X, Trash2, Clock, 
  ChevronRight, ArrowLeft, Filter, MoreVertical
} from 'lucide-react';
import { AppNotification, User } from '../types';
import { mockService } from '../services/mockDataService';
import { useNavigate } from 'react-router-dom';

interface NotificationsProps {
  user: User;
}

export const Notifications: React.FC<NotificationsProps> = ({ user }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'ORDERS'>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  const loadNotifications = () => {
    setNotifications(mockService.getAppNotifications(user.id).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  };

  const handleRead = (id: string, link?: string) => {
    mockService.markNotificationAsRead(id);
    loadNotifications();
    if (link) navigate(link);
  };

  const handleMarkAllRead = () => {
    mockService.markAllNotificationsRead(user.id);
    loadNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER': return <ShoppingCart size={20} />;
      case 'PRICE_REQUEST': return <Calculator size={20} />;
      case 'APPLICATION': return <UserPlus size={20} />;
      case 'SYSTEM': return <Sparkles size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'ORDER': return 'bg-blue-100 text-blue-600';
      case 'PRICE_REQUEST': return 'bg-indigo-100 text-indigo-600';
      case 'APPLICATION': return 'bg-orange-100 text-orange-600';
      case 'SYSTEM': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'UNREAD') return !n.isRead;
    if (activeFilter === 'ORDERS') return n.type === 'ORDER';
    return true;
  });

  // Grouping by Date
  const grouped = filtered.reduce((groups: any, n) => {
    const date = new Date(n.timestamp).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(n);
    return groups;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-emerald-600">
                <Bell size={24} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Activity Center</h1>
          </div>
          <p className="text-gray-400 font-bold text-sm tracking-tight">Track every update, lead, and confirmation across your network.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
                onClick={handleMarkAllRead}
                className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm flex items-center justify-center gap-2"
            >
                <CheckCircle2 size={16}/> Mark All Read
            </button>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-gray-100/50 rounded-2xl border border-gray-200 w-fit">
        {(['ALL', 'UNREAD', 'ORDERS'] as const).map(f => (
            <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-white text-gray-900 shadow-sm shadow-black/5' : 'text-gray-400 hover:text-gray-600'}`}
            >
                {f}
            </button>
        ))}
      </div>

      <div className="space-y-12">
        {Object.keys(grouped).length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bell size={40} className="text-gray-200"/>
                </div>
                <h3 className="text-xl font-black text-gray-300 uppercase tracking-tight">No activity matches your filter</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">New updates will appear here automatically.</p>
            </div>
        ) : Object.entries(grouped).map(([date, items]: any) => (
            <div key={date} className="space-y-4">
                <h2 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-4">
                    {date}
                    <div className="h-px flex-1 bg-gray-100"></div>
                </h2>
                <div className="grid grid-cols-1 gap-3">
                    {items.map((n: AppNotification) => (
                        <div 
                            key={n.id}
                            onClick={() => handleRead(n.id, n.link)}
                            className={`group p-6 bg-white rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between hover:shadow-xl hover:scale-[1.01] ${!n.isRead ? 'border-emerald-200 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-50' : 'border-gray-100 shadow-sm opacity-80 hover:opacity-100'}`}
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:rotate-6 ${getColor(n.type)}`}>
                                    {getIcon(n.type)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-black text-gray-900 text-lg tracking-tight uppercase">{n.title}</h3>
                                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xl">{n.message}</p>
                                    <div className="flex items-center gap-4 mt-3 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Clock size={12}/> {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        <span className="px-2 py-0.5 rounded-lg bg-gray-50 border border-gray-100">{n.type}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <ChevronRight size={20} className={`transition-all ${!n.isRead ? 'text-emerald-500 translate-x-0 group-hover:translate-x-1' : 'text-gray-200'}`}/>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};