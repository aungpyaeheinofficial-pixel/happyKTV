
import React, { useState } from 'react';
import { LayoutDashboard, Mic2, Coffee, Settings, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfirmModal } from '../common/ConfirmModal';

export const Sidebar = () => {
  const { currentView, setView, t, logout } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'rooms', label: t.rooms, icon: Mic2 },
    { id: 'menu', label: t.menu, icon: Coffee },
  ] as const;

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <>
    <div className="w-20 lg:w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300">
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Mic2 className="text-white" size={24} />
        </div>
        <span className="hidden lg:block ml-3 font-bold text-xl text-white tracking-tight">Happy KTV</span>
      </div>

      <nav className="flex-1 py-6 space-y-2 px-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center justify-center lg:justify-start px-3 py-3 rounded-xl transition-all duration-200 group ${
              currentView === item.id
                ? 'bg-purple-500/10 text-purple-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <item.icon
              size={24}
              className={`${
                currentView === item.id ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'
              }`}
            />
            <span className={`hidden lg:block ml-3 font-medium ${currentView === item.id ? 'font-semibold' : ''}`}>
              {item.label}
            </span>
            {currentView === item.id && (
              <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center lg:justify-start px-3 py-3 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="hidden lg:block ml-3 font-medium">Logout</span>
        </button>
      </div>
    </div>
    
    <ConfirmModal 
      isOpen={showLogoutConfirm}
      title="Logout?"
      message="Are you sure you want to end your session?"
      onConfirm={handleLogout}
      onCancel={() => setShowLogoutConfirm(false)}
      confirmText="Logout"
      type="danger"
    />
    </>
  );
};
