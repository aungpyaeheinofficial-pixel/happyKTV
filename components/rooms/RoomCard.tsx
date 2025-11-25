
import React, { useEffect, useState } from 'react';
import { Room } from '../../types';
import { Users, Clock, Settings, Power } from 'lucide-react';
import { formatTime, formatCurrency, getSessionDuration, calculateBill } from '../../utils';
import { useApp } from '../../context/AppContext';

interface RoomCardProps {
  room: Room;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onClick, onEdit }) => {
  const { t, language, toggleRoomActive } = useApp();
  const [elapsed, setElapsed] = useState(0);
  const [currentBill, setCurrentBill] = useState(0);

  useEffect(() => {
    let interval: any;
    if (room.status === 'occupied' && room.session) {
      const update = () => {
        if (room.session) {
           setElapsed(getSessionDuration(room.session));
           const bill = calculateBill(room.session, room);
           setCurrentBill(bill.totalAmount);
        }
      };
      
      update();
      // Only tick if not paused
      if (!room.session.isPaused) {
        interval = setInterval(update, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [room.status, room.session, room.session?.isPaused, room.session?.pausedAt, room.session?.orders]);

  const handleToggleActive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if(room.status === 'occupied') {
       alert("Cannot deactivate occupied room");
       return;
    }
    await toggleRoomActive(room.id);
  };

  const getStatusStyles = () => {
    if (!room.isActive) return 'border-slate-700 bg-slate-900/40 opacity-60';

    switch (room.status) {
      case 'occupied': return 'border-pink-500/60 bg-slate-800/90 shadow-[0_0_25px_rgba(236,72,153,0.2)]';
      case 'cleaning': return 'border-amber-500/50 bg-slate-800/60 opacity-90';
      case 'reserved': return 'border-blue-500/50 bg-slate-800/60';
      case 'maintenance': return 'border-slate-600/50 bg-slate-900/50 grayscale opacity-70';
      default: return 'border-emerald-500/30 bg-slate-800/50 hover:border-emerald-500/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]';
    }
  };

  const StatusBadge = () => {
    if (!room.isActive) {
       return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-400 border border-slate-600">
           {t.inactive}
        </span>
       );
    }

    if (room.status === 'occupied' && room.session?.isPaused) {
       return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
           <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
           {t.paused}
        </span>
       );
    }

    switch(room.status) {
      case 'occupied': return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
          {t.occupied}
        </span>
      );
      case 'cleaning': return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-spin-slow"></span>
          {t.cleaning}
        </span>
      );
      case 'reserved': return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
           <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
           {t.reserved}
        </span>
      );
       case 'maintenance': return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-600/20 text-slate-400 border border-slate-600/30">
           <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
           {t.maintenance}
        </span>
      );
      default: return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {t.available}
        </span>
      );
    }
  };

  return (
    <div 
      onClick={room.isActive ? onClick : undefined}
      className={`relative p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 group ${room.isActive ? 'hover:-translate-y-1 cursor-pointer' : 'cursor-default'} ${getStatusStyles()}`}
    >
      <div className="absolute top-4 right-4 flex gap-2 z-20">
         <StatusBadge />
         <button 
            onClick={onEdit}
            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            title={t.edit}
         >
            <Settings size={14} />
         </button>
      </div>

      <div className="mb-4 mt-2">
        <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          {language === 'en' ? room.name.en : room.name.mm}
          {room.session?.serviceCallCount && room.session.serviceCallCount > 0 && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
          )}
        </h3>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mt-1">
          <span className="px-1.5 py-0.5 rounded bg-slate-700/50 border border-slate-600">{room.type}</span>
          <span>•</span>
          <span>{formatCurrency(room.hourlyRate, language)}/hr</span>
        </div>
      </div>

      <div className="space-y-4">
        {room.status === 'occupied' && room.session ? (
          <>
            <div className="flex items-end justify-between">
              <div className={`flex items-center gap-2 ${room.session.isPaused ? 'text-amber-400' : 'text-pink-300'}`}>
                <Clock size={18} />
                <span className="font-mono text-2xl font-bold tracking-wider">
                  {formatTime(elapsed)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
               <div className="flex items-center gap-2 text-slate-300 text-sm">
                 <Users size={14} />
                 <span>{room.session.guestCount} Guests</span>
               </div>
               <span className="font-mono font-bold text-emerald-400 text-sm">
                 {formatCurrency(currentBill, language)}
               </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2 pt-2 text-sm text-slate-500">
             <div className="flex items-center gap-2">
              <Users size={16} />
              <span>Capacity: {room.capacity} Guests</span>
            </div>
            <div className="h-4"></div>
          </div>
        )}
      </div>

      {/* Active/Inactive Toggle */}
      <div className="absolute bottom-4 right-4 z-20">
         <button 
           onClick={handleToggleActive}
           className={`w-10 h-5 rounded-full flex items-center transition-colors p-1 ${room.isActive ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'}`}
           title={room.isActive ? "Set Inactive" : "Set Active"}
         >
            <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
         </button>
      </div>

      {/* Gradient Decoration */}
      {room.isActive && room.status === 'occupied' && (
        <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 rounded-r-2xl opacity-60"></div>
      )}
    </div>
  );
};
