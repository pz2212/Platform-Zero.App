import React, { useState, useEffect } from 'react';
import { User, Product, InventoryItem, OrderItem } from '../types';
import { mockService } from '../services/mockDataService';
import { 
  ShoppingCart, Search, Plus, X, Leaf, Minus, 
  Truck, Calendar, Clock, User as UserIcon, DollarSign, 
  Check, ChevronDown, Package, ShoppingBag, Sparkles, TrendingDown,
  /* Added missing Store import from lucide-react */
  Store
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductCard: React.FC<any> = ({ product, item, onAdd }) => {
    const [qty, setQty] = useState(1);
    // Age logic remains in background but age badge is removed to hide "clearance" status

    return (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 flex flex-col h-full shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 border border-gray-100">
                    <img src={product.imageUrl} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl text-gray-900 font-black uppercase tracking-tight leading-none">{product.name}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">{product.variety}</p>
            </div>

            <div className="mt-auto space-y-6">
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
                    <div>
                        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Platform Zero Rate</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-emerald-600 tracking-tighter">${(item.discountPricePerKg || product.defaultPricePerKg * 0.7).toFixed(2)}</span>
                            <span className="text-[10px] font-black text-emerald-400 uppercase">/kg</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Market Standard</p>
                        <p className="text-sm font-bold text-gray-400 line-through">${product.defaultPricePerKg.toFixed(2)}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-4">
                    <div className="flex-1 flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200/50 h-14">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><Minus size={18} strokeWidth={3}/></button>
                        <span className="flex-1 text-center font-black text-lg text-gray-900">{qty}</span>
                        <button onClick={() => setQty(qty + 1)} className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><Plus size={18} strokeWidth={3}/></button>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.quantityKg}kg ready</span>
                </div>

                <button 
                    onClick={() => onAdd(product, qty, item)} 
                    className="w-full py-5 bg-[#043003] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <ShoppingCart size={18}/> Buy Wholesale Stock
                </button>
            </div>
        </div>
    );
};

export const GrocerMarketplace: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const [agedInventory, setAgedInventory] = useState<{product: Product, item: InventoryItem}[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const products = mockService.getAllProducts();
    const inventory = mockService.getAllInventory();
    const now = new Date();

    // Logic filters for products unsold for X days, but UI hides this detail
    const aged = inventory.filter(item => {
        if (item.status !== 'Available') return false;
        const uploadedAt = new Date(item.uploadedAt);
        const diffDays = (now.getTime() - uploadedAt.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= (item.discountAfterDays || 3);
    }).map(item => ({
        item,
        product: products.find(p => p.id === item.productId)!
    })).filter(x => !!x.product);

    setAgedInventory(aged);
  }, []);

  const addToCart = (product: Product, qty: number, item: InventoryItem) => {
      const price = item.discountPricePerKg || product.defaultPricePerKg * 0.7;
      setCart(prev => [...prev, { productId: product.id, qty, price, unit: 'KG' }]);
      alert(`${product.name} added to order!`);
  };

  const handleCheckout = () => {
      if (cart.length === 0) return;
      const total = cart.reduce((sum, i) => sum + (i.qty * i.price), 0);
      mockService.createFullOrder(user.id, cart, total);
      setCart([]);
      alert("Wholesale Order Processed!");
      navigate('/');
  };

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 px-2">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-center text-indigo-600"><Store size={36} /></div>
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Wholesale Marketplace</h1>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Direct Supply • Preferred Rates • Quality Verified</p>
                </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search wholesale lots..." 
                        className="w-full pl-14 pr-8 py-5 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                <button 
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="relative px-8 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all disabled:bg-gray-100 disabled:text-gray-300 shadow-xl shadow-indigo-200"
                >
                    Review Order ({cart.length})
                </button>
            </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[3rem] flex items-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 scale-150 pointer-events-none group-hover:scale-[1.7] transition-transform duration-1000"><Sparkles size={160} className="text-indigo-900"/></div>
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0 border border-indigo-100"><Sparkles size={28}/></div>
            <div>
                <h3 className="text-lg font-black text-indigo-900 uppercase tracking-tight">Preferred Partner Access</h3>
                <p className="text-indigo-800 text-sm font-medium leading-relaxed max-w-2xl">Access direct wholesale rates across the Platform Zero network. These lots are curated for Grocers to ensure the most competitive margins in the market.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2">
            {agedInventory.filter(x => x.product.name.toLowerCase().includes(searchTerm.toLowerCase())).map((pair, idx) => (
                <ProductCard key={idx} product={pair.product} item={pair.item} onAdd={addToCart} />
            ))}
            {agedInventory.length === 0 && (
                <div className="col-span-full py-40 text-center text-gray-300">
                    <ShoppingBag size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="font-black uppercase tracking-widest">No active wholesale lots available right now.</p>
                </div>
            )}
        </div>
    </div>
  );
};
