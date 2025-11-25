import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Search, Flame, Edit2, Package } from 'lucide-react';
import { MenuItem } from '../../types';
import { formatCurrency } from '../../utils';
import { MenuFormModal } from './MenuFormModal';
import { CATEGORIES } from '../../constants';

export const MenuSettingsView = () => {
  const { menuItems, t, language } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const name = language === 'en' ? item.name.en : item.name.mm;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleEdit = (item: MenuItem) => {
    setItemToEdit(item);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setItemToEdit(null);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6 lg:p-10 h-full overflow-y-auto animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t.menu}</h1>
          <p className="text-slate-400">Manage products, pricing, and inventory</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-lg shadow-purple-500/20"
        >
          <Plus size={20} />
          <span>New Item</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
            />
         </div>
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
         </div>
      </div>

      <div className="bg-slate-800/30 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 text-sm">
            <tr>
              <th className="p-4 w-16">Icon</th>
              <th className="p-4">Name</th>
              <th className="p-4">{t.category}</th>
              <th className="p-4">{t.price}</th>
              <th className="p-4">Stock</th>
              <th className="p-4">{t.status}</th>
              <th className="p-4 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-slate-800/50 transition-colors group">
                <td className="p-4 text-2xl relative">
                   {item.image}
                   {item.isPopular && (
                     <div className="absolute top-2 right-2 bg-orange-500 rounded-full p-0.5">
                       <Flame size={10} className="text-white fill-white" />
                     </div>
                   )}
                </td>
                <td className="p-4">
                  <div className="font-medium text-white">{item.name.en}</div>
                  <div className="text-sm text-slate-500">{item.name.mm}</div>
                </td>
                <td className="p-4 text-slate-300">
                  <span className="px-2 py-1 bg-slate-700/50 border border-slate-700 rounded text-xs">{item.category}</span>
                </td>
                <td className="p-4 text-emerald-400 font-mono font-medium">{formatCurrency(item.price)}</td>
                <td className="p-4 text-slate-400 font-mono text-sm">
                   {item.stock ? (
                     <span className="flex items-center gap-1">
                        <Package size={14} /> {item.stock}
                     </span>
                   ) : '-'}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.available ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {item.available ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-slate-700 hover:bg-purple-600 text-slate-300 hover:text-white rounded-lg transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
               <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                     No items found in this category.
                  </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <MenuFormModal 
          item={itemToEdit}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};
