import React, { useState } from 'react';
import { Order, StoreSettings } from '../types';
import { Printer, ArrowLeft, MessageCircle, Phone } from 'lucide-react';

interface BillTemplateProps {
  order: Order | null;
  settings: StoreSettings;
  tableId?: string;
  onClose?: () => void;
  onUpdateDeliveryMethod?: (method: 'WhatsApp' | 'Printed', phone?: string) => void;
}

export const BillTemplate: React.FC<BillTemplateProps> = ({ order, settings, tableId, onClose, onUpdateDeliveryMethod }) => {
  const [customerPhone, setCustomerPhone] = useState('');

  if (!order) return null;

  const handlePrint = () => {
    if(onUpdateDeliveryMethod) onUpdateDeliveryMethod('Printed', customerPhone);
    window.print();
  };

  const getOrderTypeEmoji = () => order.orderType === 'eat-in' ? '🍽️' : '🥡';
  const getOrderTypeText = () => order.orderType === 'eat-in' ? 'Eat-in' : 'Takeaway';

  const generateBillText = () => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    let text = `*${settings.name}*\n`;
    text += `${settings.address}\n`;
    text += `Tel: ${settings.phone}\n\n`;
    text += `*Bill Receipt*\n`;
    text += `Type: ${getOrderTypeEmoji()} ${getOrderTypeText()}\n`;
    text += `Table: ${tableId?.replace('t', '')}\n`;
    text += `Date: ${date} ${time}\n`;
    text += `--------------------------------\n`;
    
    order.items.forEach(item => {
      text += `${item.name} x ${item.quantity}: ${settings.currency}${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    text += `--------------------------------\n`;
    text += `Subtotal: ${settings.currency}${order.subtotal.toFixed(2)}\n`;
    text += `Tax: ${settings.currency}${order.taxAmount.toFixed(2)}\n`;
    text += `*Total: ${settings.currency}${order.total.toFixed(2)}*\n\n`;
    text += `Thank you for dining with us!`;

    return encodeURIComponent(text);
  };

  const handleWhatsApp = () => {
    if (!customerPhone) {
      alert('Please enter a customer phone number');
      return;
    }

    let cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    if(onUpdateDeliveryMethod) onUpdateDeliveryMethod('WhatsApp', customerPhone);

    const text = generateBillText();
    const url = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      id="printable-bill" 
      className="fixed inset-0 w-full h-full bg-white z-[9999] overflow-y-auto flex flex-col print:absolute print:inset-0 print:h-auto print:overflow-visible print:block"
    >
      <div className="print:hidden sticky top-0 bg-gray-900/95 backdrop-blur text-white p-3 md:p-4 flex flex-col md:flex-row justify-between items-center gap-3 shadow-lg z-50">
        <div className="w-full md:w-auto flex justify-between md:justify-start items-center">
          <button 
            onClick={onClose}
            className="flex items-center space-x-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <span className="md:hidden text-sm font-bold text-gray-300">Bill Preview</span>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/20">
              <div className="px-2 text-gray-400">
                <Phone size={16} />
              </div>
              <input 
                type="tel" 
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Customer Mobile (e.g. 98765...)"
                className="bg-transparent border-none text-white placeholder-gray-400 text-sm focus:ring-0 w-full md:w-48 outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleWhatsApp}
                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95 text-sm whitespace-nowrap"
              >
                <MessageCircle size={18} />
                <span>WhatsApp</span>
              </button>
              
              <button 
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95 text-sm whitespace-nowrap"
              >
                <Printer size={18} />
                <span>Print</span>
              </button>
            </div>
        </div>
      </div>

      <div className="p-8 font-mono text-sm leading-tight max-w-lg mx-auto w-full flex-grow">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-widest">{settings.name}</h1>
          <p className="mt-1 text-gray-600">{settings.address}</p>
          <p className="text-gray-600">Tel: {settings.phone}</p>
        </div>

        <div className="mb-4 border-b border-gray-300 pb-2">
          <div className="flex justify-between">
            <span>Date: {new Date().toLocaleDateString()}</span>
            <span>Time: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-bold">{getOrderTypeEmoji()} {getOrderTypeText()}</span>
            <span>Table: {tableId?.replace('t', '')}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Bill #: {order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          {order.customerName && (
             <div className="mt-1">Customer: {order.customerName}</div>
          )}
        </div>

        <table className="w-full mb-4">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-1">Item</th>
              <th className="text-right py-1">Qty</th>
              <th className="text-right py-1">Price</th>
              <th className="text-right py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-1">
                  <div>{item.name}</div>
                  {item.note && <div className="text-[10px] italic text-gray-500">Note: {item.note}</div>}
                </td>
                <td className="text-right py-1 align-top">{item.quantity}</td>
                <td className="text-right py-1 align-top">{settings.currency}{item.price.toFixed(2)}</td>
                <td className="text-right py-1 align-top">{settings.currency}{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-black pt-2 flex flex-col items-end space-y-1">
          <div className="w-48 flex justify-between">
            <span>Subtotal:</span>
            <span>{settings.currency}{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="w-48 flex justify-between">
            <span>GST ({settings.gstRate}%):</span>
            <span>{settings.currency}{order.taxAmount.toFixed(2)}</span>
          </div>
          <div className="w-48 flex justify-between font-bold text-lg border-t border-black mt-2 pt-2">
            <span>Total:</span>
            <span>{settings.currency}{order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-12 text-center text-xs">
          <p>Thank you for dining with us!</p>
          <p>Please visit again.</p>
          <p className="mt-4 text-[10px] text-gray-400">Powered by RestoBill AI</p>
        </div>
      </div>
    </div>
  );
};