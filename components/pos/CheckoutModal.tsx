
import React, { useState, useEffect } from 'react';
import { Room, PaymentMethod } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, CreditCard, Banknote, CheckCircle, Calculator, Wallet } from 'lucide-react';
import { calculateBill, formatCurrency } from '../../utils';

interface Props {
  room: Room;
  onClose: () => void;
}

export const CheckoutModal: React.FC<Props> = ({ room, onClose }) => {
  const { checkoutSession, t, language } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amountTendered, setAmountTendered] = useState<string>('');
  
  if (!room.session) return null;
  const bill = calculateBill(room.session, room);

  const handleConfirm = async () => {
    const paid = parseFloat(amountTendered) || bill.totalAmount;
    await checkoutSession(room.id, paymentMethod, paid);
    onClose();
    // Ideally trigger a toast notification here through context or a global event
    alert(`Session ended. Total: ${formatCurrency(bill.totalAmount, language)}`);
  };

  const change = (parseFloat(amountTendered) || 0) - bill.totalAmount;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
             <CreditCard size={24} className="text-purple-500" />
             {t.checkout}: {room.name.en}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col lg:flex-row gap-8 h-full">
             
             {/* Left: Bill Summary */}
             <div className="flex-1 space-y-4">
                <h3 className="font-bold text-slate-300 border-b border-slate-800 pb-2">{t.billSummary}</h3>
                
                {/* Room Charges */}
                <div className="flex justify-between items-center text-sm">
                   <div>
                      <span className="text-slate-200 block">{t.roomCharges}</span>
                      <span className="text-xs text-slate-500">{bill.billableHours} hrs @ {room.hourlyRate}</span>
                   </div>
                   <span className="font-mono text-slate-300">{formatCurrency(bill.roomCharges, language)}</span>
                </div>

                {/* Orders */}
                <div className="space-y-2">
                   <div className="text-slate-200 text-sm">{t.foodAndDrinks}</div>
                   {room.session.orders.map(order => (
                      <div key={order.id} className="flex justify-between items-center text-xs text-slate-400 pl-2 border-l-2 border-slate-800">
                         <span>{order.quantity}x {language === 'en' ? order.name.en : order.name.mm}</span>
                         <span className="font-mono">{formatCurrency(order.subtotal, language)}</span>
                      </div>
                   ))}
                   <div className="flex justify-between items-center text-sm pt-1 border-t border-slate-800/50">
                      <span className="text-slate-500">Total Items</span>
                      <span className="font-mono text-slate-300">{formatCurrency(bill.orderTotal, language)}</span>
                   </div>
                </div>

                {/* Totals */}
                <div className="pt-4 space-y-2 border-t border-slate-800">
                   <div className="flex justify-between text-sm text-slate-400">
                      <span>{t.subtotal}</span>
                      <span>{formatCurrency(bill.subtotal, language)}</span>
                   </div>
                   {bill.discount > 0 && (
                     <div className="flex justify-between text-sm text-emerald-500">
                        <span>{t.discount}</span>
                        <span>-{formatCurrency(bill.discount, language)}</span>
                     </div>
                   )}
                   <div className="flex justify-between text-sm text-slate-500">
                      <span>{t.tax} + {t.service}</span>
                      <span>{formatCurrency(bill.tax + bill.serviceCharge, language)}</span>
                   </div>
                   <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold text-white">{t.total}</span>
                      <span className="text-2xl font-bold text-purple-400 font-mono">{formatCurrency(bill.totalAmount, language)}</span>
                   </div>
                </div>
             </div>

             {/* Right: Payment Controls */}
             <div className="flex-1 bg-slate-800/30 rounded-xl p-6 border border-slate-800 flex flex-col gap-6">
                <div>
                   <label className="text-sm font-medium text-slate-400 mb-3 block">{t.paymentMethod}</label>
                   <div className="grid grid-cols-2 gap-3">
                      {(['Cash', 'Card', 'KBZ Pay', 'Wave Money'] as const).map(method => (
                         <button
                           key={method}
                           onClick={() => setPaymentMethod(method)}
                           className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                             paymentMethod === method 
                             ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' 
                             : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                           }`}
                         >
                            {method === 'Cash' && <Banknote size={16} />}
                            {method === 'Card' && <CreditCard size={16} />}
                            {(method === 'KBZ Pay' || method === 'Wave Money') && <Wallet size={16} />}
                            <span className="text-sm font-medium">{method}</span>
                         </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="text-sm font-medium text-slate-400 mb-3 block">{t.amountTendered}</label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-lg">Ks</span>
                      <input 
                        type="number" 
                        value={amountTendered}
                        onChange={(e) => setAmountTendered(e.target.value)}
                        placeholder={bill.totalAmount.toString()}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-2xl font-mono text-white focus:border-purple-500 outline-none transition-colors"
                        autoFocus
                      />
                   </div>
                </div>

                <div className="mt-auto bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                   <div className="flex justify-between items-center">
                      <span className="text-slate-400">{t.change}</span>
                      <span className={`text-xl font-mono font-bold ${change < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                         {formatCurrency(Math.max(0, change), language)}
                      </span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-800 bg-slate-800/50 flex gap-4">
           <button 
             onClick={onClose}
             className="flex-1 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
           >
             {t.cancel}
           </button>
           <button 
             onClick={handleConfirm}
             className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
           >
             <CheckCircle size={20} />
             {t.confirm} & {t.paid}
           </button>
        </div>
      </div>
    </div>
  );
};
