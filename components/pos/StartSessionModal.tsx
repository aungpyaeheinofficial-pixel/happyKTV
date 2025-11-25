
import React, { useState } from 'react';
import { Room } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Users, MessageSquare, User, CreditCard } from 'lucide-react';
import { WAITERS } from '../../constants';

interface Props {
  room: Room;
  onClose: () => void;
}

export const StartSessionModal: React.FC<Props> = ({ room, onClose }) => {
  const { startSession, t, language } = useApp();
  const [guestCount, setGuestCount] = useState(2);
  const [notes, setNotes] = useState('');
  const [selectedWaiter, setSelectedWaiter] = useState(WAITERS[0]);
  const [memberCard, setMemberCard] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startSession(room.id, guestCount, notes, selectedWaiter, memberCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <div>
             <h2 className="text-xl font-bold text-white">{t.startSession}</h2>
             <p className="text-sm text-slate-400">{language === 'en' ? room.name.en : room.name.mm} • {room.type}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Users size={16} /> {t.guests}
                </label>
                <input 
                  type="number" 
                  min={1} 
                  max={room.capacity}
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors text-lg text-center font-mono"
                />
             </div>
             
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <User size={16} /> {t.waiter}
                </label>
                <select
                  value={selectedWaiter}
                  onChange={(e) => setSelectedWaiter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                   {WAITERS.map(w => (
                     <option key={w} value={w}>{w}</option>
                   ))}
                </select>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <CreditCard size={16} /> {t.memberCard}
            </label>
            <input 
              type="text"
              value={memberCard}
              onChange={(e) => setMemberCard(e.target.value)}
              placeholder="Enter Member ID (Optional)"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <MessageSquare size={16} /> {t.notes}
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors h-20 resize-none"
              placeholder="Any special requests..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
            >
              {t.cancel}
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              {t.start}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
