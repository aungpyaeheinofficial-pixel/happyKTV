import React, { useState, useEffect } from 'react';
import { MenuItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Save, Trash2 } from 'lucide-react';
import { generateId } from '../../utils';
import { CATEGORIES } from '../../constants';
import { ConfirmModal } from '../common/ConfirmModal';

interface Props {
  item?: MenuItem | null; // If null, creating new
  onClose: () => void;
}

export const MenuFormModal: React.FC<Props> = ({ item, onClose }) => {
  const { saveMenuItem, deleteMenuItem } = useApp();
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: { en: '', mm: '' },
    category: 'Food',
    price: 0,
    available: true,
    image: '🍽️',
    isPopular: false,
    stock: 100
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemToSave: MenuItem = {
      id: item?.id || generateId('M'),
      name: formData.name as { en: string; mm: string },
      category: formData.category || 'Food',
      price: Number(formData.price),
      image: formData.image || '🍽️',
      available: formData.available || false,
      isPopular: formData.isPopular,
      stock: Number(formData.stock)
    };

    await saveMenuItem(itemToSave);
    onClose();
  };

  const handleDelete = async () => {
    if (item) {
      await deleteMenuItem(item.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-white">{item ? 'Edit Item' : 'New Item'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Name (English)</label>
                <input 
                  type="text" 
                  value={formData.name?.en}
                  onChange={e => setFormData({...formData, name: { ...formData.name!, en: e.target.value }})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Name (Myanmar)</label>
                <input 
                  type="text" 
                  value={formData.name?.mm}
                  onChange={e => setFormData({...formData, name: { ...formData.name!, mm: e.target.value }})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
                />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
                >
                  {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Icon (Emoji)</label>
                <input 
                  type="text" 
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none text-center"
                  maxLength={2}
                />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Price (Ks)</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Stock</label>
                <input 
                  type="number" 
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
                />
              </div>
           </div>

           <div className="flex items-center gap-6 pt-2">
             <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="available"
                  checked={formData.available || false}
                  onChange={e => setFormData({...formData, available: e.target.checked})}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="available" className="text-sm text-slate-300">Available</label>
             </div>
             
             <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="popular"
                  checked={formData.isPopular || false}
                  onChange={e => setFormData({...formData, isPopular: e.target.checked})}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="popular" className="text-sm text-slate-300 flex items-center gap-1">Is Popular <span className="text-xs">🔥</span></label>
             </div>
           </div>

           <div className="flex justify-between items-center pt-6">
              {item ? (
                <button 
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                >
                   <Trash2 size={18} />
                   <span>Delete</span>
                </button>
              ) : <div></div>}
              
              <div className="flex gap-3">
                 <button 
                   type="button"
                   onClick={onClose}
                   className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-2"
                 >
                   <Save size={18} />
                   <span>Save Item</span>
                 </button>
              </div>
           </div>
        </form>
      </div>
    </div>
    
    <ConfirmModal 
      isOpen={showDeleteConfirm}
      title="Delete Item?"
      message="Are you sure you want to delete this menu item?"
      onConfirm={handleDelete}
      onCancel={() => setShowDeleteConfirm(false)}
      type="danger"
    />
    </>
  );
};
