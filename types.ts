
export type Language = 'en' | 'mm';

export type ViewState = 'dashboard' | 'rooms' | 'menu';

export type RoomType = 'Standard' | 'VIP' | 'VVIP';

export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'reserved' | 'maintenance';

export type OrderStatus = 'pending' | 'preparing' | 'served';

export type PaymentMethod = 'Cash' | 'Card' | 'KBZ Pay' | 'Wave Money';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
  name: string;
}

export interface MenuItem {
  id: string;
  name: {
    en: string;
    mm: string;
  };
  category: string;
  price: number;
  image: string; // Emoji or icon placeholder
  available: boolean;
  isPopular?: boolean;
  stock?: number;
  description?: { en: string; mm: string };
  preparationTime?: number; // in minutes
}

export interface OrderItem {
  id: string; // Unique ID for the order line item
  menuItemId: string;
  name: { en: string; mm: string };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  timestamp: number;
  specialRequest?: string;
  status: OrderStatus;
}

export interface Session {
  id: string;
  roomId: string;
  startTime: number;
  endTime?: number; // Present if session is completed
  pausedAt: number | null;
  totalPausedDuration: number;
  isPaused?: boolean;
  guestCount: number;
  guestName?: string;
  memberCard?: string;
  assignedWaiter?: string;
  serviceCallCount: number;
  orders: OrderItem[];
  notes?: string;
  minimumHours: number; // Snapshot of room rule at start
  
  // Financial Snapshot (for completed sessions)
  totalBill?: number;
  roomCharges?: number;
  orderCharges?: number;
  discount?: number;
  tax?: number;
  serviceCharge?: number;
  paymentMethod?: PaymentMethod;
  paidAmount?: number;
  changeAmount?: number;
}

export interface Room {
  id: string;
  name: { en: string; mm: string };
  type: RoomType;
  capacity: number;
  hourlyRate: number;
  status: RoomStatus;
  floor: number;
  features?: string[];
  smoking?: boolean;
  minimumHours: number;
  isActive: boolean;
  session: Session | null;
}

export interface BillSummary {
  activeDuration: number;
  billableHours: number; // Post-minimum charge logic
  roomCharges: number;
  orderTotal: number;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  totalAmount: number;
  isMinimumChargeApplied: boolean;
}

export interface Translation {
  dashboard: string;
  rooms: string;
  menu: string;
  available: string;
  occupied: string;
  cleaning: string;
  reserved: string;
  maintenance: string;
  startSession: string;
  endSession: string;
  pauseSession: string;
  resumeSession: string;
  guests: string;
  activeRooms: string;
  revenue: string;
  totalGuests: string;
  avgDuration: string;
  serviceCalls: string;
  searchMenu: string;
  billSummary: string;
  roomCharges: string;
  foodAndDrinks: string;
  subtotal: string;
  total: string;
  cancel: string;
  confirm: string;
  addItems: string;
  printBill: string;
  checkout: string;
  callWaiter: string;
  duration: string;
  price: string;
  qty: string;
  tax: string;
  service: string;
  discount: string;
  settings: string;
  save: string;
  delete: string;
  category: string;
  status: string;
  actions: string;
  start: string;
  notes: string;
  waiter: string;
  memberCard: string;
  specialRequest: string;
  popular: string;
  minimumCharge: string;
  paused: string;
  login: string;
  username: string;
  password: string;
  logout: string;
  edit: string;
  paymentMethod: string;
  amountTendered: string;
  change: string;
  paid: string;
  active: string;
  inactive: string;
  floor: string;
  capacity: string;
  hourlyRate: string;
}
