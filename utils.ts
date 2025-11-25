
import { BillSummary, Room, Session } from "./types";

export const formatCurrency = (amount: number, lang: 'en' | 'mm' = 'en'): string => {
  const formatted = new Intl.NumberFormat('en-MM', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  return lang === 'mm' ? `${formatted} ကျပ်` : `${formatted} Ks`;
};

export const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

export const getSessionDuration = (session: Session): number => {
  if (session.isPaused && session.pausedAt) {
    // If paused, the active duration stops at pausedAt
    return Math.max(0, session.pausedAt - session.startTime - session.totalPausedDuration);
  }
  // If running, it's now - start - paused
  return Math.max(0, Date.now() - session.startTime - session.totalPausedDuration);
};

export const calculateBill = (session: Session, room: Room): BillSummary => {
  // 1. Active Duration (excluding paused time)
  const activeDuration = getSessionDuration(session);
  const activeHours = activeDuration / (1000 * 60 * 60);
  
  // 2. Minimum Hours
  const minHours = session.minimumHours || room.minimumHours || 2;
  
  let billableHours = activeHours;
  let isMinimumChargeApplied = false;
  
  if (billableHours < minHours) {
    billableHours = minHours;
    isMinimumChargeApplied = true;
  }
  
  // 3. Round up to nearest 0.5 hour
  billableHours = Math.ceil(billableHours * 2) / 2;
  
  // 4. Room Charges
  const roomCharges = billableHours * room.hourlyRate;
  
  // 5. Order Charges
  const orderTotal = session.orders.reduce((sum, item) => sum + item.subtotal, 0);
  
  const subtotal = roomCharges + orderTotal;
  
  // 6. Discount (Member)
  const discount = session.memberCard ? roomCharges * 0.10 : 0;
  
  const afterDiscount = subtotal - discount;
  
  // 7. Tax & Service
  const tax = afterDiscount * 0.05;
  const serviceCharge = afterDiscount * 0.10;
  
  const totalAmount = afterDiscount + tax + serviceCharge;

  return {
    activeDuration,
    billableHours,
    roomCharges,
    orderTotal,
    subtotal,
    tax,
    serviceCharge,
    discount,
    totalAmount,
    isMinimumChargeApplied
  };
};

export const getDateRange = (filterType: 'today' | 'yesterday' | 'thisWeek' | 'thisMonth') => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  
  switch (filterType) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
      
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = new Date(yesterday.setHours(0, 0, 0, 0));
      endDate = new Date(yesterday.setHours(23, 59, 59, 999));
      break;
      
    case 'thisWeek':
      const day = now.getDay() || 7; // Get current day number, make Sunday 7
      if (day !== 1) now.setHours(-24 * (day - 1)); // Set to Monday
      startDate = new Date(now.setHours(0, 0, 0, 0));
      const endOfWeek = new Date(startDate);
      endOfWeek.setDate(startDate.getDate() + 6);
      endDate = new Date(endOfWeek.setHours(23, 59, 59, 999));
      break;
      
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
  }
  
  return { startDate: startDate.getTime(), endDate: endDate.getTime() };
};

// --- Storage Helpers ---

export const storage = {
  async set(key: string, value: any) {
    if (typeof window !== 'undefined' && (window as any).storage) {
      try {
        await (window as any).storage.set(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('Storage Set Error:', e);
        return false;
      }
    }
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  },

  async get<T>(key: string): Promise<T | null> {
    if (typeof window !== 'undefined' && (window as any).storage) {
      try {
        const item = await (window as any).storage.get(key);
        return item && item.value ? JSON.parse(item.value) : null;
      } catch (e) {
        console.error('Storage Get Error:', e);
        return null;
      }
    }
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  },

  async list(prefix: string): Promise<any[]> {
    if (typeof window !== 'undefined' && (window as any).storage) {
      try {
        const items = await (window as any).storage.list(prefix);
        return items || [];
      } catch (e) {
        console.error('Storage List Error:', e);
        return [];
      }
    }
    return Object.keys(localStorage)
      .filter(k => k.startsWith(prefix))
      .map(k => ({ key: k, value: localStorage.getItem(k) }));
  },

  async remove(key: string) {
    if (typeof window !== 'undefined' && (window as any).storage) {
      await (window as any).storage.remove(key);
    } else {
      localStorage.removeItem(key);
    }
  },
  
  async delete(key: string) {
     return this.remove(key);
  }
};

export const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
