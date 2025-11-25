
import React, { useState, useEffect } from 'react';
import { Room, RoomType } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Save, Trash2 } from 'lucide-react';
import { generateId } from '../../utils';
import { ConfirmModal } from '../common/ConfirmModal';

interface Props {
  room?: Room | null; // If null, creating new
  onClose: () => void;
}

export const RoomFormModal: React.FC<Props> = ({ room, onClose }) => {
  const { saveRoom, deleteRoom, t } = useApp();
  const [formData, setFormData] = useState<Partial<Room>>({
    name: { en: '', mm: '' },
    type: 'Standard',
    capacity: 8,
    hourlyRate: 8000,
    floor: 1,
    status: 'available',
    minimumHours: 2,
    smoking: false,
    isActive: true
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (room) {
      setFormData({ ...room });
    }
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const roomToSave: Room = {
      id: room?.id || generateId('V'),
      name: formData.name as { en: string; mm: string },
      type: formData.type as RoomType,
      capacity: Number(formData.capacity),
      hourlyRate: Number(formData.hourlyRate),
      floor: Number(formData.floor),
      status: room?.status || 'available', // Preserve status if editing, else available
      session: room?.session || null,
      minimumHours: Number(formData.minimumHours),
      smoking: formData.smoking,
      isActive: formData.isActive !== undefined ? formData.isActive : true
    };

    await saveRoom(roomToSave);
    onClose();
  };

  const handleDelete = async () => {
    if (room) {
      await deleteRoom(room.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-white">{room ? 'Edit Room' : 'New Room'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Room Name (EN)</label>
                <input 
                  type="text" 
                  value={formData.name?.en}
                  onChange={e => setFormData({...formData, name: { ...formData.name!, en: e.target.value }})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
                  placeholder="VIP 1"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Room Name (MM)</label>
                <input 
                  type="text" 
                  value={formData.name?.mm}
                  onChange={e => setFormData({...formData, name: { ...formData.name!, mm: e.target.value }})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
                  placeholder="အခန်း ၁"
                />
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as RoomType})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
                >
                  <option value="Standard">Standard</option>
                  <option value="VIP">VIP</option>
                  <option value="VVIP">VVIP</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Hourly Rate (Ks)</label>
                <input 
                  type="number" 
                  value={formData.hourlyRate}
                  onChange={e => setFormData({...formData, hourlyRate: Number(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
                />
              </div>
           </div>

           <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Capacity</label>
                <input 
                  type="number" 
                  value={formData.capacity}
                  onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Floor</label>
                <input 
                  type="number" 
                  value={formData.floor}
                  onChange={e => setFormData({...formData, floor: Number(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Min. Hours</label>
                <input 
                  type="number" 
                  value={formData.minimumHours}
                  onChange={e => setFormData({...formData, minimumHours: Number(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
                />
              </div>
           </div>

           <div className="flex items-center gap-6 pt-2">
             <div className="flex items-center gap-2">
                 <input 
                   type="checkbox" 
                   id="smoking"
                   checked={formData.smoking || false}
                   onChange={e => setFormData({...formData, smoking: e.target.checked})}
                   className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500"
                 />
                 <label htmlFor="smoking" className="text-sm text-slate-300">Smoking Allowed</label>
             </div>
             
             <div className="flex items-center gap-2">
                 <input 
                   type="checkbox" 
                   id="active"
                   checked={formData.isActive !== false}
                   onChange={e => setFormData({...formData, isActive: e.target.checked})}
                   className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                 />
                 <label htmlFor="active" className="text-sm text-slate-300">Active Room</label>
             </div>
           </div>

           <div className="flex justify-between items-center pt-6">
              {room ? (
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
                   <span>Save Room</span>
                 </button>
              </div>
           </div>
        </form>
      </div>
    </div>
    
    <ConfirmModal 
      isOpen={showDeleteConfirm}
      title="Delete Room?"
      message="This action cannot be undone. Active sessions will be lost."
      onConfirm={handleDelete}
      onCancel={() => setShowDeleteConfirm(false)}
      type="danger"
    />
    </>
  );
};
