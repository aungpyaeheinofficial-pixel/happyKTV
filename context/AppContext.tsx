
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Room, MenuItem, ViewState, Language, RoomStatus, Session, OrderItem, User, PaymentMethod } from '../types';
import { INITIAL_ROOMS, INITIAL_MENU, TRANSLATIONS } from '../constants';
import { calculateBill, generateId, storage } from '../utils';

interface AppContextType {
  user: User | null;
  rooms: Room[];
  menuItems: MenuItem[];
  sessionHistory: Session[];
  currentView: ViewState;
  language: Language;
  t: typeof TRANSLATIONS['en'];
  isLoading: boolean;

  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  
  setView: (view: ViewState) => void;
  toggleLanguage: () => void;
  
  // Room Actions
  saveRoom: (room: Room) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  toggleRoomActive: (roomId: string) => Promise<void>;
  
  // Session Actions
  startSession: (roomId: string, guestCount: number, notes?: string, waiter?: string, memberCard?: string) => void;
  checkoutSession: (roomId: string, paymentMethod: PaymentMethod, paidAmount: number) => Promise<void>;
  endSession: (roomId: string) => void; // Legacy/Quick end
  pauseSession: (roomId: string) => void;
  resumeSession: (roomId: string) => void;
  updateSessionStartTime: (roomId: string, newStartTime: number) => void;
  callWaiter: (roomId: string) => void;
  
  // Order Actions
  addOrderToSession: (roomId: string, item: MenuItem, quantity: number, specialRequest?: string) => void;
  updateOrderQuantity: (roomId: string, orderId: string, delta: number) => void;
  removeOrderFromSession: (roomId: string, orderId: string) => void;
  updateOrderRequest: (roomId: string, orderId: string, request: string) => void;
  
  // Menu Actions
  saveMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
  const [currentView, setView] = useState<ViewState>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  // --- Initialization & Auth ---

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      
      const storedUser = await storage.get<User>('current-user');
      if (storedUser) setUser(storedUser);

      const roomData = await storage.list('room:');
      if (roomData.length > 0) {
        setRooms(roomData.map(item => JSON.parse(item.value)).sort((a: Room, b: Room) => a.id.localeCompare(b.id)));
      } else {
        setRooms(INITIAL_ROOMS);
        INITIAL_ROOMS.forEach(r => storage.set(`room:${r.id}`, r));
      }

      const menuData = await storage.list('menu:');
      if (menuData.length > 0) {
        setMenuItems(menuData.map(item => JSON.parse(item.value)).sort((a: MenuItem, b: MenuItem) => a.name.en.localeCompare(b.name.en)));
      } else {
        setMenuItems(INITIAL_MENU);
        INITIAL_MENU.forEach(m => storage.set(`menu:${m.id}`, m));
      }

      const historyData = await storage.list('session-history:');
      if (historyData.length > 0) {
        setSessionHistory(historyData.map(item => JSON.parse(item.value)).sort((a: Session, b: Session) => b.startTime - a.startTime));
      }

      setIsLoading(false);
    };

    initApp();
  }, []);

  // --- Auth Handlers ---

  const login = async (u: string, p: string): Promise<boolean> => {
    if ((u === 'admin' && p === 'admin123') || (u === 'staff' && p === 'staff123')) {
      const newUser: User = { 
        id: u === 'admin' ? 'u1' : 'u2', 
        username: u, 
        role: u === 'admin' ? 'admin' : 'staff', 
        name: u === 'admin' ? 'Manager' : 'Staff' 
      };
      setUser(newUser);
      await storage.set('current-user', newUser);
      return true;
    }
    return false;
  };

  const logout = async () => {
    setUser(null);
    await storage.remove('current-user');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'mm' : 'en');
  };

  // --- Room Management ---

  const saveRoom = async (room: Room) => {
    setRooms(prev => {
      const exists = prev.find(r => r.id === room.id);
      let newRooms;
      if (exists) {
        newRooms = prev.map(r => r.id === room.id ? room : r);
      } else {
        newRooms = [...prev, room];
      }
      return newRooms.sort((a, b) => a.id.localeCompare(b.id));
    });
    await storage.set(`room:${room.id}`, room);
  };

  const deleteRoom = async (roomId: string) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
    await storage.remove(`room:${roomId}`);
  };

  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRooms(prev => {
      const updated = prev.map(r => {
        if (r.id === roomId) {
          const updatedRoom = { ...r, status };
          storage.set(`room:${r.id}`, updatedRoom);
          return updatedRoom;
        }
        return r;
      });
      return updated;
    });
  };

  const toggleRoomActive = async (roomId: string) => {
    let updatedRoom: Room | undefined;
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        updatedRoom = { ...r, isActive: !r.isActive };
        return updatedRoom;
      }
      return r;
    }));
    if (updatedRoom) await storage.set(`room:${roomId}`, updatedRoom);
  };

  // --- Session Logic ---

  const updateRoomAndPersist = (roomId: string, updater: (r: Room) => Room) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const newRoom = updater(r);
        storage.set(`room:${newRoom.id}`, newRoom);
        return newRoom;
      }
      return r;
    }));
  };

  const startSession = (roomId: string, guestCount: number, notes?: string, waiter?: string, memberCard?: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const newSession: Session = {
      id: generateId('SES'),
      roomId,
      startTime: Date.now(),
      pausedAt: null,
      totalPausedDuration: 0,
      isPaused: false,
      guestCount,
      assignedWaiter: waiter,
      memberCard,
      orders: [],
      notes,
      serviceCallCount: 0,
      minimumHours: room.minimumHours || 2
    };

    updateRoomAndPersist(roomId, r => ({ ...r, status: 'occupied', session: newSession }));
  };

  const pauseSession = (roomId: string) => {
    updateRoomAndPersist(roomId, r => {
      if (r.session && !r.session.isPaused) {
        return { 
          ...r, 
          session: { 
            ...r.session, 
            isPaused: true,
            pausedAt: Date.now() 
          } 
        };
      }
      return r;
    });
  };

  const resumeSession = (roomId: string) => {
    updateRoomAndPersist(roomId, r => {
      if (r.session && r.session.isPaused && r.session.pausedAt) {
        const pauseDuration = Date.now() - r.session.pausedAt;
        return {
          ...r,
          session: {
            ...r.session,
            isPaused: false,
            pausedAt: null,
            totalPausedDuration: r.session.totalPausedDuration + pauseDuration
          }
        };
      }
      return r;
    });
  };

  const checkoutSession = async (roomId: string, paymentMethod: PaymentMethod, paidAmount: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room || !room.session) return;

    const bill = calculateBill(room.session, room);
    const completedSession: Session = {
      ...room.session,
      endTime: Date.now(),
      totalBill: bill.totalAmount,
      roomCharges: bill.roomCharges,
      orderCharges: bill.orderTotal,
      tax: bill.tax,
      serviceCharge: bill.serviceCharge,
      discount: bill.discount,
      paymentMethod,
      paidAmount,
      changeAmount: paidAmount - bill.totalAmount
    };

    await storage.set(`session-history:${completedSession.id}`, completedSession);
    setSessionHistory(prev => [completedSession, ...prev]);

    // Set to cleaning
    updateRoomAndPersist(roomId, r => ({ ...r, status: 'cleaning', session: null }));
    
    // Auto available after 15 mins (optional, but requested in prompt logic)
    // For now we just leave it in cleaning, user can manually available or we rely on cleaning logic
  };

  const endSession = (roomId: string) => {
     // Quick end (legacy), defaults to Cash/Exact amount
     checkoutSession(roomId, 'Cash', 0); // 0 means exact for now if UI doesnt support it
  };

  const updateSessionStartTime = (roomId: string, newStartTime: number) => {
     updateRoomAndPersist(roomId, r => {
        if(r.session) {
           return { ...r, session: { ...r.session, startTime: newStartTime } };
        }
        return r;
     });
  };

  const callWaiter = (roomId: string) => {
    updateRoomAndPersist(roomId, r => {
      if (r.session) {
        return { ...r, session: { ...r.session, serviceCallCount: r.session.serviceCallCount + 1 } };
      }
      return r;
    });
  };

  // --- Order Logic ---

  const addOrderToSession = (roomId: string, item: MenuItem, quantity: number, specialRequest?: string) => {
    updateRoomAndPersist(roomId, room => {
      if (!room.session) return room;
      
      // Check if same item exists to aggregate
      const existingIdx = room.session.orders.findIndex(o => o.menuItemId === item.id);
      
      let newOrders = [...room.session.orders];
      
      if (existingIdx >= 0) {
        const existing = newOrders[existingIdx];
        const newQty = existing.quantity + quantity;
        newOrders[existingIdx] = {
           ...existing,
           quantity: newQty,
           subtotal: newQty * existing.unitPrice
        };
      } else {
        const newOrder: OrderItem = {
          id: generateId('ORD'),
          menuItemId: item.id,
          name: item.name,
          quantity,
          unitPrice: item.price,
          subtotal: item.price * quantity,
          timestamp: Date.now(),
          status: 'pending',
          specialRequest
        };
        newOrders.push(newOrder);
      }
      
      return { ...room, session: { ...room.session, orders: newOrders } };
    });
  };

  const updateOrderQuantity = (roomId: string, orderId: string, delta: number) => {
    updateRoomAndPersist(roomId, room => {
      if (!room.session) return room;
      const newOrders = room.session.orders.map(order => {
        if (order.id === orderId) {
          const newQty = Math.max(1, order.quantity + delta);
          return { ...order, quantity: newQty, subtotal: newQty * order.unitPrice };
        }
        return order;
      });
      return { ...room, session: { ...room.session, orders: newOrders } };
    });
  };

  const updateOrderRequest = (roomId: string, orderId: string, request: string) => {
    updateRoomAndPersist(roomId, room => {
      if (!room.session) return room;
      const newOrders = room.session.orders.map(order => 
        order.id === orderId ? { ...order, specialRequest: request } : order
      );
      return { ...room, session: { ...room.session, orders: newOrders } };
    });
  };

  const removeOrderFromSession = (roomId: string, orderId: string) => {
    updateRoomAndPersist(roomId, room => {
      if (!room.session) return room;
      const newOrders = room.session.orders.filter(o => o.id !== orderId);
      return { ...room, session: { ...room.session, orders: newOrders } };
    });
  };

  // --- Menu Management ---

  const saveMenuItem = async (item: MenuItem) => {
    setMenuItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      let newMenu;
      if (exists) {
        newMenu = prev.map(i => i.id === item.id ? item : i);
      } else {
        newMenu = [...prev, item];
      }
      return newMenu.sort((a, b) => a.name.en.localeCompare(b.name.en));
    });
    await storage.set(`menu:${item.id}`, item);
  };

  const deleteMenuItem = async (id: string) => {
    setMenuItems(prev => prev.filter(i => i.id !== id));
    await storage.remove(`menu:${id}`);
  };

  return (
    <AppContext.Provider value={{
      user,
      rooms,
      menuItems,
      sessionHistory,
      currentView,
      language,
      t: TRANSLATIONS[language],
      isLoading,
      login,
      logout,
      setView,
      toggleLanguage,
      saveRoom,
      deleteRoom,
      updateRoomStatus,
      toggleRoomActive,
      startSession,
      endSession,
      checkoutSession,
      pauseSession,
      resumeSession,
      updateSessionStartTime,
      callWaiter,
      addOrderToSession,
      updateOrderQuantity,
      removeOrderFromSession,
      updateOrderRequest,
      saveMenuItem,
      deleteMenuItem
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
