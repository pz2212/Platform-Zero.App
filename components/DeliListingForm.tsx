
import React, { useState } from 'react';
import { Store, Link as LinkIcon, Upload, Loader2 } from 'lucide-react';
import { mockService } from '../services/mockDataService';
import { User } from '../types';

export const DeliListingForm: React.FC<{ user: User, onComplete: () => void }> = ({ user, onComplete }) => {
    const [formData, setFormData] = useState({
        productName: '',
        price: '',
        quantity: '',
        description: ''
    });
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        setTimeout(() => {
            mockService.uploadToDeli(formData, user.businessName);
            setIsUploading(false);
            setFormData({ productName: '', price: '', quantity: '', description: '' });
            alert("Success! Your product is now live on The Deli App storefront.");
            onComplete();
        }, 1500);
    };

    return (
        <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-8 flex flex-col h-full animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-6 h-6 bg-white flex items-center justify-center text-[#4F46E5]"><Store size={24} /></div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Sell on The Deli</h2>
            </div>

            <div className="bg-[#EEF2FF] p-5 rounded-2xl border border-indigo-100 mb-10 flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#4F46E5] shrink-0 border border-indigo-50"><LinkIcon size={20} /></div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-black text-[#1E1B4B] text-[13px] uppercase tracking-tight">API Connected</span>
                        <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">LIVE</span>
                    </div>
                    <p className="text-[#4338CA] text-[11px] font-medium leading-relaxed">
                        Products listed here are instantly synced via API to your <span className="font-black">The Deli App</span> storefront.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 flex-1 flex flex-col">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PRODUCT NAME</label>
                    <input 
                        required 
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-300" 
                        placeholder="e.g. Daily Special: Lasagna" 
                        value={formData.productName} 
                        onChange={e => setFormData({...formData, productName: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PRICE ($)</label>
                        <input 
                            required 
                            type="number" 
                            step="0.01" 
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-300" 
                            placeholder="12.50" 
                            value={formData.price} 
                            onChange={e => setFormData({...formData, price: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">QUANTITY</label>
                        <input 
                            required 
                            type="number" 
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-300" 
                            placeholder="10" 
                            value={formData.quantity} 
                            onChange={e => setFormData({...formData, quantity: e.target.value})}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">DESCRIPTION</label>
                    <textarea 
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none transition-all placeholder-gray-300" 
                        placeholder="Ingredients, allergens, heating instructions..." 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isUploading} 
                    className="w-full mt-auto py-5 bg-[#4F46E5] text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-xl shadow-indigo-100 hover:bg-[#4338CA] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                    {isUploading ? <Loader2 className="animate-spin" size={20}/> : <><Upload size={20}/> Upload to Deli</>}
                </button>
            </form>
        </div>
    );
};
