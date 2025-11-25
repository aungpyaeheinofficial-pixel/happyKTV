import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { RoomGridView } from './components/rooms/RoomGridView';
import { MenuSettingsView } from './components/menu/MenuSettingsView';
import { AppProvider, useApp } from './context/AppContext';
import { Globe, LogOut, Loader2 } from 'lucide-react';
import { LoginScreen } from './components/auth/LoginScreen';

const MainContent = () => {
  const { currentView, language, toggleLanguage, user, logout, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="text-purple-500 animate-spin" size={48} />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'rooms': return <RoomGridView />;
      case 'menu': return <MenuSettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-slate-800 bg-slate-950 flex justify-between items-center px-6 lg:px-10 flex-shrink-0">
          <div className="lg:hidden">
             {/* Mobile Menu Placeholder - Sidebar handles collision */}
             <span className="font-bold text-xl text-white">Happy KTV</span>
          </div>
          <div className="flex-1"></div> {/* Spacer */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Globe size={18} />
              <span className="font-medium">{language === 'en' ? 'EN' : 'MM'}</span>
            </button>
            <div className="w-px h-8 bg-slate-800 mx-2"></div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-white">{user.name}</span>
              <span className="text-xs text-slate-500 capitalize">{user.role}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5">
               <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold uppercase">
                 {user.name.substring(0, 2)}
               </div>
            </div>
            <button 
              onClick={logout}
              className="ml-2 p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
              title="Logout"
            >
               <LogOut size={20} />
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-hidden relative">
           <div className="absolute inset-0 overflow-y-auto">
             {renderView()}
           </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
