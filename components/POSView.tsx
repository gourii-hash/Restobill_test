import React, { useState, useEffect } from 'react';
import { MenuItem, Order, StoreSettings, Table } from '../types';
import { Search, Plus, Minus, Trash2, Receipt, ChefHat, Save, Loader2, MessageSquare, ShoppingCart, ChevronDown, ChevronUp, X, CreditCard, Banknote, Smartphone, Utensils } from 'lucide-react';

interface POSViewProps {
  activeTable: Table;
  activeOrder: Order | null;
  menu: MenuItem[];
  categories: string[];
  settings: StoreSettings;
  onUpdateOrder: (order: Order) => void;
  onCompleteOrder: (order: Order) => void;
  onPrintBill: (order: Order) => void;
  onExit: () => void;
  isPrinting?: boolean;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const POSView: React.FC<POSViewProps> = ({
  activeTable,
  activeOrder,
  menu,
  categories,
  settings,
  onUpdateOrder,
  onCompleteOrder,
  onPrintBill,
  onExit,
  isPrinting = false,
  showToast
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [localOrder, setLocalOrder] = useState<Order | null>(activeOrder);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  // Payment State
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Card' | 'UPI'>('Cash');
  const [deliveryMethod, setDeliveryMethod] = useState<'WhatsApp' | 'Printed' | 'None'>('None');
  const [orderType, setOrderType] = useState<'eat-in' | 'takeaway'>('eat-in');

  // Mobile specific state
  const [mobileViewMode, setMobileViewMode] = useState<'menu' | 'cart'>('menu');

  useEffect(() => {
    if (!activeOrder) {
      const newOrder: Order = {
        id: crypto.randomUUID(),
        tableId: activeTable.id,
        items: [],
        status: 'active',
        createdAt: Date.now(),
        subtotal: 0,
        taxAmount: 0,
        serviceChargeAmount: 0,
        discountAmount: 0,
        total: 0,
        orderType: 'eat-in',
        paymentMode: 'Cash',
        deliveryMethod: 'None'
      };
      setLocalOrder(newOrder);
      setOrderType('eat-in');
      setDeliveryMethod('None');
    } else {
      setLocalOrder(activeOrder);
      if(activeOrder.paymentMode) setPaymentMode(activeOrder.paymentMode);
      if(activeOrder.deliveryMethod) setDeliveryMethod(activeOrder.deliveryMethod);
      if(activeOrder.orderType) setOrderType(activeOrder.orderType);
    }
  }, [activeOrder, activeTable.id]);

  const calculateTotals = (items: Order['items']) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = (subtotal * settings.gstRate) / 100;
    const serviceChargeAmount = (subtotal * settings.serviceChargeRate) / 100;
    const total = subtotal + taxAmount + serviceChargeAmount;
    return { subtotal, taxAmount, serviceChargeAmount, total };
  };

  const handleOrderTypeChange = (type: 'eat-in' | 'takeaway') => {
    setOrderType(type);
    if (localOrder) {
      const updatedOrder = { ...localOrder, orderType: type };
      setLocalOrder(updatedOrder);
      onUpdateOrder(updatedOrder);
      showToast(`Switched to ${type.toUpperCase()}`, 'info');
    }
  };

  const addToOrder = (menuItem: MenuItem) => {
    if (!localOrder) return;

    const existingItemIndex = localOrder.items.findIndex(i => i.menuItemId === menuItem.id);
    let newItems;

    if (existingItemIndex > -1) {
      newItems = [...localOrder.items];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + 1
      };
    } else {
      newItems = [...localOrder.items, {
        id: crypto.randomUUID(),
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        note: ''
      }];
    }

    const totals = calculateTotals(newItems);
    const updatedOrder = { ...localOrder, items: newItems, ...totals, orderType };
    setLocalOrder(updatedOrder);
    onUpdateOrder(updatedOrder);
    showToast(`Added ${menuItem.name}`, 'success');
  };

  const updateQuantity = (itemId: string, delta: number) => {
    if (!localOrder) return;

    const newItems = localOrder.items.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0);

    const totals = calculateTotals(newItems);
    const updatedOrder = { ...localOrder, items: newItems, ...totals };
    setLocalOrder(updatedOrder);
    onUpdateOrder(updatedOrder);
  };

  const updateItemNote = (itemId: string, note: string) => {
    if (!localOrder) return;
    const newItems = localOrder.items.map(item => 
      item.id === itemId ? { ...item, note } : item
    );
    const updatedOrder = { ...localOrder, items: newItems };
    setLocalOrder(updatedOrder);
    onUpdateOrder(updatedOrder);
  };

  const handlePrintClick = () => {
    if (!localOrder || localOrder.items.length === 0) return;
    setDeliveryMethod('Printed');
    onPrintBill({ ...localOrder, deliveryMethod: 'Printed', orderType });
    showToast('Opening print dialog...', 'info');
  };

  const handleComplete = () => {
    if(!localOrder) return;
    onCompleteOrder({ 
        ...localOrder, 
        paymentMode: paymentMode,
        deliveryMethod: deliveryMethod,
        orderType: orderType
    });
  }

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!localOrder) return <div>Loading...</div>;

  const orderItemCount = localOrder.items.reduce((acc, item) => acc + item.quantity, 0);

  const OrderSummaryContent = () => (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Order Type Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-2">
            <button 
              onClick={() => handleOrderTypeChange('eat-in')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${orderType === 'eat-in' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
            >
              <Utensils size={16} />
              <span>Eat In</span>
            </button>
            <button 
              onClick={() => handleOrderTypeChange('takeaway')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${orderType === 'takeaway' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
            >
              <ShoppingCart size={16} />
              <span>Takeaway</span>
            </button>
          </div>

          {localOrder.items.length === 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center text-gray-400 space-y-2">
              <ChefHat size={48} className="opacity-20" />
              <p>No items added yet</p>
            </div>
          ) : (
            localOrder.items.map(item => (
              <div key={item.id} className="flex flex-col gap-2 group border-b border-gray-50 pb-2 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{settings.currency}{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-red-500"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-green-500"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-sm font-bold w-16 text-right">
                      {settings.currency}{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                   {editingNoteId === item.id ? (
                     <div className="flex-1 flex gap-2">
                       <input 
                         type="text" 
                         autoFocus
                         className="flex-1 text-xs border border-blue-200 bg-blue-50 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                         placeholder="Add note..."
                         value={item.note || ''}
                         onChange={(e) => updateItemNote(item.id, e.target.value)}
                         onBlur={() => setEditingNoteId(null)}
                         onKeyDown={(e) => e.key === 'Enter' && setEditingNoteId(null)}
                       />
                     </div>
                   ) : (
                     <button 
                       onClick={() => setEditingNoteId(item.id)}
                       className={`flex items-center gap-1 text-xs hover:bg-gray-100 px-2 py-1 rounded transition-colors ${item.note ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
                     >
                       <MessageSquare size={12} />
                       <span>{item.note || 'Add Note'}</span>
                     </button>
                   )}
                </div>
              </div>
            ))
          )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{settings.currency}{localOrder.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>GST ({settings.gstRate}%)</span>
              <span>{settings.currency}{localOrder.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-800 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{settings.currency}{localOrder.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="bg-white p-2 rounded-lg border border-gray-200 flex justify-between gap-2">
             <button 
               onClick={() => setPaymentMode('Cash')}
               className={`flex-1 flex items-center justify-center gap-1 py-2 rounded text-xs font-bold transition-colors ${paymentMode === 'Cash' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-50'}`}
             >
               <Banknote size={16} /> Cash
             </button>
             <button 
               onClick={() => setPaymentMode('UPI')}
               className={`flex-1 flex items-center justify-center gap-1 py-2 rounded text-xs font-bold transition-colors ${paymentMode === 'UPI' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
             >
               <Smartphone size={16} /> UPI
             </button>
             <button 
               onClick={() => setPaymentMode('Card')}
               className={`flex-1 flex items-center justify-center gap-1 py-2 rounded text-xs font-bold transition-colors ${paymentMode === 'Card' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-50'}`}
             >
               <CreditCard size={16} /> Card
             </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handlePrintClick}
              disabled={isPrinting || localOrder.items.length === 0}
              className="flex items-center justify-center space-x-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Receipt size={18} />}
              <span>Print/WA</span>
            </button>
            <button 
              onClick={handleComplete}
              disabled={localOrder.items.length === 0 || isPrinting}
              className="flex items-center justify-center space-x-2 bg-primary text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
            >
              <Save size={18} />
              <span>Complete</span>
            </button>
          </div>
      </div>
    </>
  );

  return (
    <div className="relative h-full flex flex-col lg:flex-row gap-4">
      <div className={`flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${mobileViewMode === 'cart' ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search menu..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  selectedCategory === cat 
                    ? 'bg-primary text-white shadow-md shadow-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-24 lg:pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredMenu.map(item => (
              <button
                key={item.id}
                onClick={() => addToOrder(item)}
                className="flex flex-row lg:flex-col items-center lg:items-start p-3 lg:p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all text-left group active:scale-[0.98]"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-800 line-clamp-1 group-hover:text-primary">{item.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2 lg:mb-3">{item.description}</p>
                  <span className="text-sm font-bold text-gray-900">{settings.currency}{item.price}</span>
                </div>
                <div className="flex-shrink-0 bg-white shadow-sm p-2 rounded-lg text-primary">
                  <Plus size={18} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-96 bg-white rounded-xl shadow-sm border border-gray-100 flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-bold text-lg text-gray-800">Order #{localOrder.id.slice(0, 6)}</h2>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">{activeTable.name}</span>
          </div>
        </div>
        <OrderSummaryContent />
      </div>

      {mobileViewMode === 'menu' && (
        <div className="lg:hidden fixed bottom-20 left-4 right-4 z-20">
          <button 
             onClick={() => setMobileViewMode('cart')}
             className="w-full bg-gray-900 text-white rounded-xl shadow-xl p-4 flex justify-between items-center"
          >
             <div className="flex items-center space-x-3">
               <div className="bg-white/20 px-2 py-1 rounded text-xs font-bold">{orderItemCount} items</div>
               <span className="font-bold">{settings.currency}{localOrder.total.toFixed(2)}</span>
             </div>
             <div className="flex items-center space-x-2">
               <span className="text-sm font-medium">View Bill</span>
               <ChevronUp size={16} />
             </div>
          </button>
        </div>
      )}

      {mobileViewMode === 'cart' && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-200">
           <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
             <div>
                <h2 className="font-bold text-lg">Current Order</h2>
                <p className="text-xs text-gray-500">{activeTable.name}</p>
             </div>
             <button 
               onClick={() => setMobileViewMode('menu')}
               className="p-2 bg-white rounded-full shadow-sm text-gray-500"
             >
               <ChevronDown size={20} />
             </button>
           </div>
           <OrderSummaryContent />
        </div>
      )}
    </div>
  );
};