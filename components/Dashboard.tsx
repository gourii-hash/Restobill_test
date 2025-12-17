import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Order, MenuItem, StoreSettings } from '../types';
import { Sparkles, TrendingUp, DollarSign, ShoppingBag, Loader2, Calendar, FileText, Smartphone, Printer, CreditCard, Search, ArrowUpDown, Banknote, Phone } from 'lucide-react';

interface DashboardProps {
  orders: Order[];
  menu: MenuItem[];
  settings: StoreSettings;
}

export const Dashboard: React.FC<DashboardProps> = ({ orders, menu, settings }) => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [transactionSearch, setTransactionSearch] = useState('');

  // --- Data Processing ---

  // Filter Completed Orders
  const completedOrders = useMemo(() => orders.filter(o => o.status === 'completed' && o.completedAt).sort((a,b) => (b.completedAt || 0) - (a.completedAt || 0)), [orders]);

  // Group Data based on Time Range
  const reportData = useMemo(() => {
    const grouped: Record<string, { date: string; sales: number; orders: number }> = {};
    const now = new Date();

    completedOrders.forEach(order => {
      if (!order.completedAt) return;
      const date = new Date(order.completedAt);
      let key = '';
      let displayDate = '';

      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (timeRange === 'daily' && diffDays <= 1) { 
         // Daily view breakdown logic could go here, simplified to last 7 days breakdown for "Daily" mode
         key = date.toISOString().split('T')[0];
         displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (timeRange === 'weekly') {
         if(diffDays <= 30) {
            key = date.toISOString().split('T')[0];
            displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
         }
      } else if (timeRange === 'monthly') {
         key = `${date.getFullYear()}-${date.getMonth()}`;
         displayDate = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }

      if (key) {
        if (!grouped[key]) {
          grouped[key] = { date: displayDate, sales: 0, orders: 0 };
        }
        grouped[key].sales += order.total;
        grouped[key].orders += 1;
      }
    });

    // Sort by date key
    return Object.keys(grouped).sort().map(k => grouped[k]);
  }, [completedOrders, timeRange]);

  // Totals for Summary Cards
  const totalSales = reportData.reduce((acc, curr) => acc + curr.sales, 0);
  const totalOrdersCount = reportData.reduce((acc, curr) => acc + curr.orders, 0);

  // --- Payment Mode Analysis ---
  const paymentData = useMemo(() => {
    const counts = { Cash: 0, Card: 0, UPI: 0 };
    completedOrders.forEach(o => {
      if (o.paymentMode && counts[o.paymentMode] !== undefined) {
         counts[o.paymentMode]++;
      } else {
         counts['Cash']++;
      }
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key as keyof typeof counts] }));
  }, [completedOrders]);

  // --- Delivery Method Analysis ---
  const deliveryData = useMemo(() => {
    const counts = { WhatsApp: 0, Printed: 0, None: 0 };
    completedOrders.forEach(o => {
      if (o.deliveryMethod && counts[o.deliveryMethod] !== undefined) {
        counts[o.deliveryMethod]++;
      } else {
        counts['None']++;
      }
    });
    return [
      { name: 'WhatsApp', value: counts.WhatsApp },
      { name: 'Printed', value: counts.Printed },
      { name: 'None', value: counts.None }
    ];
  }, [completedOrders]);

  // --- Filtered Transactions for Table ---
  const filteredTransactions = useMemo(() => {
    return completedOrders.filter(o => 
       o.customerName?.toLowerCase().includes(transactionSearch.toLowerCase()) || 
       o.customerPhone?.includes(transactionSearch) ||
       o.id.toLowerCase().includes(transactionSearch.toLowerCase())
    );
  }, [completedOrders, transactionSearch]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-6 space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Business Analytics</h2>
           <p className="text-sm text-gray-500">Track sales and orders</p>
        </div>
        
        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
          {(['daily', 'weekly', 'monthly'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                timeRange === range ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Total Sales</p>
              <h3 className="text-2xl font-bold text-gray-800">{settings.currency}{totalSales.toFixed(0)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalOrdersCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
          <h3 className="font-bold text-gray-700 mb-6">Sales Performance ({timeRange})</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={reportData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip formatter={(value: number) => `${settings.currency}${value.toFixed(0)}`} />
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" name="Sales" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Insights Column */}
        <div className="space-y-6">
          
          {/* Payment Modes */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[240px]">
            <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
              <CreditCard size={18} /> Payment Modes
            </h3>
            <div className="h-[180px] w-full flex">
               <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col justify-center gap-2 text-sm w-[40%]">
                 {paymentData.map((entry, index) => (
                   <div key={entry.name} className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                     <span>{entry.name}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Bill Delivery Stats */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[240px]">
             <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Smartphone size={18} /> Bill Delivery
            </h3>
            <div className="space-y-4">
               {deliveryData.map(item => {
                 const total = completedOrders.length || 1;
                 const percent = (item.value / total) * 100;
                 return (
                   <div key={item.name}>
                     <div className="flex justify-between text-xs mb-1">
                       <span className="flex items-center gap-1">
                         {item.name === 'WhatsApp' && <Smartphone size={12} />}
                         {item.name === 'Printed' && <Printer size={12} />}
                         {item.name === 'None' && <FileText size={12} />}
                         {item.name}
                       </span>
                       <span className="font-bold">{item.value} ({percent.toFixed(0)}%)</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-2">
                       <div 
                         className={`h-2 rounded-full ${item.name === 'WhatsApp' ? 'bg-green-500' : item.name === 'Printed' ? 'bg-blue-500' : 'bg-gray-400'}`} 
                         style={{ width: `${percent}%` }}
                       ></div>
                     </div>
                   </div>
                 )
               })}
            </div>
          </div>

        </div>
      </div>

      {/* Transaction History / Customer Ledger */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
              <FileText size={20} /> Transaction History
            </h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search name or phone..."
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Bill Given Via</th>
                  <th className="px-6 py-4 text-center">Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.slice(0, 50).map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{new Date(order.completedAt || 0).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">{new Date(order.completedAt || 0).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="font-medium text-gray-800">{order.customerName || 'Walk-in'}</div>
                       {order.customerPhone && (
                         <div className="text-xs text-gray-500 flex items-center gap-1">
                           <Phone size={10} /> {order.customerPhone}
                         </div>
                       )}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">
                      {settings.currency}{order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit
                        ${order.paymentMode === 'UPI' ? 'bg-blue-100 text-blue-700' : 
                          order.paymentMode === 'Card' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                        {order.paymentMode === 'UPI' && <Smartphone size={10} />}
                        {order.paymentMode === 'Card' && <CreditCard size={10} />}
                        {order.paymentMode === 'Cash' && <Banknote size={10} />}
                        {order.paymentMode || 'Cash'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit
                        ${order.deliveryMethod === 'WhatsApp' ? 'bg-green-50 text-green-600 border border-green-200' : 
                          order.deliveryMethod === 'Printed' ? 'bg-gray-100 text-gray-600 border border-gray-200' : 'text-gray-400'}`}>
                         {order.deliveryMethod === 'WhatsApp' && <Smartphone size={10} />}
                         {order.deliveryMethod === 'Printed' && <Printer size={10} />}
                         {order.deliveryMethod || 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)}
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No transactions found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
         </div>
         {filteredTransactions.length > 50 && (
           <div className="p-4 bg-gray-50 text-center text-xs text-gray-500 border-t border-gray-200">
             Showing recent 50 of {filteredTransactions.length} transactions
           </div>
         )}
      </div>
    </div>
  );
};