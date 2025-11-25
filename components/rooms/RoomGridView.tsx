import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoomCard } from './RoomCard';
import { Plus, Search } from 'lucide-react';
import { Room } from '../../types';
import { StartSessionModal } from '../pos/StartSessionModal';
import { ActiveSessionModal } from '../pos/ActiveSessionModal';
import { RoomFormModal } from './RoomFormModal';

export const RoomGridView = () => {
  const { rooms, t, updateRoomStatus } = useApp();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isActiveModalOpen, setIsActiveModalOpen] = useState(false);
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    if (room.status === 'occupied') {
      setIsActiveModalOpen(true);
    } else if (room.status === 'available') {
      setIsStartModalOpen(true);
    } else if (room.status === 'cleaning') {
      if (confirm('Finish cleaning and make room available?')) {
        updateRoomStatus(room.id, 'available');
      }
    }
  };

  const handleEditRoom = (e: React.MouseEvent, room: Room) => {
    e.stopPropagation();
    setRoomToEdit(room);
    setIsRoomFormOpen(true);
  };

  const handleAddNewRoom = () => {
    setRoomToEdit(null);
    setIsRoomFormOpen(true);
  };

  return (
    <div className="p-6 lg:p-10 h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t.rooms}</h1>
          <p className="text-slate-400">Manage room status and sessions</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search rooms..." 
              className="bg-slate-800 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 transition-colors w-64"
            />
          </div>
          <button 
             onClick={handleAddNewRoom}
             className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg shadow-purple-500/20"
          >
             <Plus size={20} />
             <span>New Room</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {rooms.map(room => (
          <RoomCard 
            key={room.id} 
            room={room} 
            onClick={() => handleRoomClick(room)} 
            onEdit={(e) => handleEditRoom(e, room)}
          />
        ))}
        
        {/* Add New Room Placeholder */}
        <div 
          onClick={handleAddNewRoom}
          className="border-2 border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-600 hover:border-purple-500/50 hover:bg-slate-800/30 hover:text-purple-400 transition-all cursor-pointer min-h-[200px]"
        >
          <Plus size={32} className="mb-2" />
          <span className="font-medium">Add New Room</span>
        </div>
      </div>

      {isStartModalOpen && selectedRoom && (
        <StartSessionModal 
          room={selectedRoom} 
          onClose={() => setIsStartModalOpen(false)} 
        />
      )}

      {isActiveModalOpen && selectedRoom && (
        <ActiveSessionModal 
          room={selectedRoom} 
          onClose={() => setIsActiveModalOpen(false)} 
        />
      )}

      {isRoomFormOpen && (
        <RoomFormModal 
          room={roomToEdit}
          onClose={() => setIsRoomFormOpen(false)}
        />
      )}
    </div>
  );
};
