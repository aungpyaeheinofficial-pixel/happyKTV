
import React, { useState, useEffect, useMemo } from 'react';
import { Room } from '../../types';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Search, Trash2, Printer, CreditCard, Plus, Minus, Clock, ShoppingCart, Pause, Play, Flame, Bell, Calendar, MessageSquare } from 'lucide-react';
import { CATEGORIES } from '../../constants';
import { formatCurrency, calculateBill, formatTime, getSessionDuration } from '../../utils';
import { CheckoutModal } from './CheckoutModal';

interface Props {
  room: Room;
  onClose: () => void;
}

export const ActiveSessionModal: React.FC<Props> = ({ room, onClose }) => {
  const { t, menuItems, addOrderToSession, updateOrderQuantity, removeOrderFromSession, updateOrderRequest, pauseSession, resumeSession, updateSessionStartTime, callWaiter, language } = useApp();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [bill, setBill] = useState(room.session ? calculateBill(room.session, room) : null);
  const [showDateEdit, setShowDateEdit] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [editOrderNoteId, setEditOrderNoteId] = useState<string | null>(null);

  // Timer Effect
  useEffect(() => {
    if (!room.session) return;
    const update = () => {
      setElapsed(getSessionDuration(room.session!));
      setBill(calculateBill(room.session!, room));
    };
    update();
    
    let interval: any;
    // Tick only if running
    if (!room.session.isPaused) {
      interval = setInterval(update, 1000);
    }
    
    return () => clearInterval(interval);
  }, [room.session, room.session?.isPaused, room.session?.pausedAt, room.session?.orders, room.session?.startTime]);

  const filteredMenu = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const name = language === 'en' ? item.name.en : item.name.mm;
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, searchQuery, language]);

  const handleCallWaiter = () => {
    callWaiter(room.id);
    alert(t.waiter + " notified!");
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if(!room.session) return;
     const [hours, minutes] = e.target.value.split(':').map(Number);
     const newDate = new Date(room.session.startTime);
     newDate.setHours(hours);
     newDate.setMinutes(minutes);
     updateSessionStartTime(room.id, newDate.getTime());
  };

  if (!room.session || !bill) return null;

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-slate-950 border border-slate-800 w-full h-full md:h-[95vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <div className="h-16 border-b border-slate-800 bg-slate-900/80 px-4 md:px-6 flex justify-between items-center flex-shrink-0">
           <div className="flex items-center gap-4 md:gap-6">
             <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                <ChevronLeft size={20} />
                <span className="hidden md:inline font-medium">Back</span>
             </button>
             <div className="h-8 w-px bg-slate-800 hidden md:block"></div>
             <div>
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                   {room.name.en}
                   <span className="text-xs font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{room.type}</span>
                </h2>
                {room.session.assignedWaiter && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {t.waiter}: {room.session.assignedWaiter}
                  </p>
                )}
             </div>
           </div>

           <div className="flex items-center gap-3 md:gap-4">
              <div className="relative group hidden md:block">
                 <button 
                   onClick={() => setShowDateEdit(!showDateEdit)}
                   className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white border border-slate-700"
                 >
                    <Calendar size={18} />
                 </button>
                 {showDateEdit && (
                    <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl z-50 w-48">
                       <label className="text-xs text-slate-400 mb-1 block">Start Time</label>
                       <input 
                         type="time" 
                         className="bg-slate-900 border border-slate-600 rounded p-1 text-white w-full"
                         value={new Date(room.session.startTime).toTimeString().substr(0, 5)}
                         onChange={handleTimeChange}
                       />
                    </div>
                 )}
              </div>

              <div className={`px-3 py-1.5 rounded-lg flex items-center gap-3 border transition-colors ${room.session.isPaused ? 'bg-amber-500/10 border-amber-500/30' : 'bg-pink-500/10 border-pink-500/30'}`}>
                 {room.session.isPaused ? (
                    <span className="text-amber-400 text-xs font-bold px-1.5 py-0.5 bg-amber-500/20 rounded uppercase tracking-wider">PAUSED</span>
                 ) : (
                    <Clock size={16} className="text-pink-400 animate-pulse" />
                 )}
                 <span className={`font-mono text-lg font-bold ${room.session.isPaused ? 'text-amber-400' : 'text-pink-300'}`}>
                    {formatTime(elapsed)}
                 </span>
                 <button 
                   onClick={() => room.session?.isPaused ? resumeSession(room.id) : pauseSession(room.id)}
                   className={`p-1.5 rounded-md transition-colors ${room.session.isPaused ? 'hover:bg-amber-500/20 text-amber-400' : 'hover:bg-pink-500/20 text-pink-400'}`}
                   title={room.session.isPaused ? t.resumeSession : t.pauseSession}
                 >
                    {room.session.isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                 </button>
              </div>
              <button 
                onClick={handleCallWaiter}
                className="p-2 bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all relative group"
                title={t.callWaiter}
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 hidden group-hover:inline-flex"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 hidden group-hover:inline-flex"></span>
                </span>
              </button>
           </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* LEFT: Menu (60%) */}
          <div className="flex-[3] flex flex-col border-r border-slate-800 bg-slate-950/50 relative">
            {/* Categories & Search */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md z-10">
               <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text" 
                      placeholder={t.searchMenu}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <button 
                     onClick={() => setActiveCategory("Popular")}
                     className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium border transition-all ${
                        activeCategory === "Popular" 
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                     }`}
                  >
                     <Flame size={16} className={activeCategory === "Popular" ? "fill-orange-400" : ""} />
                     <span>{t.popular}</span>
                  </button>
               </div>
               
               <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-linear-fade">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        activeCategory === cat 
                          ? 'bg-white text-slate-950 shadow-lg shadow-white/10' 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
               </div>
            </div>

            {/* Menu Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(activeCategory === 'Popular' ? menuItems.filter(i => i.isPopular) : filteredMenu).map(item => (
                  <div 
                    key={item.id}
                    className="group bg-slate-800/40 border border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-800/80 p-4 rounded-2xl cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col h-[180px]"
                  >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                       <button 
                         onClick={(e) => {
                            e.stopPropagation();
                            addOrderToSession(room.id, item, 1);
                         }}
                         className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/40 hover:bg-purple-400 hover:scale-110 transition-all"
                       >
                          <Plus size={18} />
                       </button>
                    </div>
                    
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">{item.image}</div>
                    
                    <div className="mt-auto">
                       <h4 className="font-bold text-slate-100 leading-tight mb-1 line-clamp-2">
                         {language === 'en' ? item.name.en : item.name.mm}
                       </h4>
                       <p className="font-mono text-purple-400 font-medium">
                         {formatCurrency(item.price, language)}
                       </p>
                    </div>
                    
                    {/* Click Area Override to add item */}
                    <div className="absolute inset-0 z-0" onClick={() => addOrderToSession(room.id, item, 1)}></div>

                    {item.isPopular && (
                       <div className="absolute top-0 right-0 bg-gradient-to-bl from-orange-500 to-red-500 w-6 h-6 flex items-center justify-center rounded-bl-xl pointer-events-none">
                          <Flame size={12} className="text-white fill-white" />
                       </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Cart (40%) */}
          <div className="flex-[2] flex flex-col bg-slate-900 border-l border-slate-800 min-w-[350px] max-w-[500px] shadow-2xl">
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h3 className="font-bold text-white flex items-center gap-2">
                   <ShoppingCart size={18} className="text-purple-400" />
                   Orders
                   <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700">
                      {room.session.orders.reduce((acc, o) => acc + o.quantity, 0)} items
                   </span>
                </h3>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {room.session.orders.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                    <ShoppingCart size={48} className="mb-4" />
                    <p>Cart is empty</p>
                  </div>
                ) : (
                   room.session.orders.map((order) => (
                      <div key={order.id} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 group hover:border-slate-600 transition-colors">
                         <div className="flex justify-between items-start mb-2">
                            <div>
                               <h4 className="font-medium text-slate-200">{language === 'en' ? order.name.en : order.name.mm}</h4>
                               <p className="text-xs text-slate-500">{formatCurrency(order.unitPrice, language)} / unit</p>
                            </div>
                            <p className="font-mono font-bold text-slate-200">{formatCurrency(order.subtotal, language)}</p>
                         </div>
                         
                         {/* Special Request */}
                         <div className="mb-3">
                            {editOrderNoteId === order.id ? (
                               <div className="flex gap-2">
                                  <input 
                                    autoFocus
                                    type="text" 
                                    className="bg-slate-900 text-xs text-white p-1.5 rounded border border-slate-700 w-full"
                                    defaultValue={order.specialRequest || ''}
                                    onBlur={(e) => {
                                       updateOrderRequest(room.id, order.id, e.target.value);
                                       setEditOrderNoteId(null);
                                    }}
                                    onKeyDown={(e) => {
                                       if(e.key === 'Enter') {
                                          updateOrderRequest(room.id, order.id, e.currentTarget.value);
                                          setEditOrderNoteId(null);
                                       }
                                    }}
                                  />
                               </div>
                            ) : (
                               <button 
                                 onClick={() => setEditOrderNoteId(order.id)}
                                 className="flex items-center gap-1 text-xs text-slate-500 hover:text-purple-400 transition-colors"
                               >
                                  <MessageSquare size={12} />
                                  <span>{order.specialRequest || 'Add note...'}</span>
                               </button>
                            )}
                         </div>

                         <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-1 border border-slate-800">
                               <button 
                                 onClick={() => order.quantity > 1 ? updateOrderQuantity(room.id, order.id, -1) : removeOrderFromSession(room.id, order.id)}
                                 className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                               >
                                  <Minus size={14} />
                               </button>
                               <span className="w-6 text-center font-mono text-sm font-medium">{order.quantity}</span>
                               <button 
                                 onClick={() => updateOrderQuantity(room.id, order.id, 1)}
                                 className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                               >
                                  <Plus size={14} />
                               </button>
                            </div>
                            
                            <button 
                               onClick={() => removeOrderFromSession(room.id, order.id)}
                               className="text-slate-600 hover:text-red-400 transition-colors"
                            >
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </div>
                   ))
                )}
             </div>

             {/* Bill Summary Footer */}
             <div className="bg-slate-950 border-t border-slate-800 p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] relative z-20">
                <div className="space-y-2 mb-4">
                   <div className="flex justify-between text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                         {t.roomCharges} 
                         <span className="text-xs bg-slate-800 px-1.5 rounded text-slate-500">
                           {bill.billableHours.toFixed(1)}h {bill.isMinimumChargeApplied ? '(Min)' : ''}
                         </span>
                      </span>
                      <span className="font-mono">{formatCurrency(bill.roomCharges, language)}</span>
                   </div>
                   <div className="flex justify-between text-sm text-slate-400">
                      <span>{t.foodAndDrinks}</span>
                      <span className="font-mono">{formatCurrency(bill.orderTotal, language)}</span>
                   </div>
                   
                   {bill.discount > 0 && (
                     <div className="flex justify-between text-sm text-emerald-400/80">
                        <span>{t.discount} (Member)</span>
                        <span className="font-mono">-{formatCurrency(bill.discount, language)}</span>
                     </div>
                   )}

                   <div className="h-px bg-slate-800 my-2"></div>
                   
                   <div className="flex justify-between text-sm text-slate-500">
                      <span>{t.tax} + {t.service}</span>
                      <span className="font-mono">{formatCurrency(bill.tax + bill.serviceCharge, language)}</span>
                   </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                   <span className="text-lg font-bold text-white">{t.total}</span>
                   <span className="text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                      {formatCurrency(bill.totalAmount, language)}
                   </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                   <button className="col-span-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium flex flex-col items-center justify-center gap-1 transition-colors border border-slate-700">
                      <Printer size={20} />
                      <span className="text-xs">{t.printBill}</span>
                   </button>
                   <button 
                      onClick={() => setIsCheckoutOpen(true)}
                      className="col-span-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
                   >
                      <CreditCard size={20} />
                      <span>{t.checkout}</span>
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    {isCheckoutOpen && (
       <CheckoutModal 
          room={room} 
          onClose={() => {
             setIsCheckoutOpen(false);
             onClose(); // Close parent modal too on success? No, user might cancel. Wait, CheckoutModal onClose handles cancel.
          }} 
       />
    )}
    </>
  );
};
