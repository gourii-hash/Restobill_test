import React, { useState, useEffect } from 'react';
import { ViewState, Table, Order, StoreSettings, ToastMessage, MenuItem, Staff } from './types';
import { INITIAL_SETTINGS } from './constants';
import { LayoutDashboard, Grid, Settings as SettingsIcon, Utensils, Users, Menu as MenuIcon, LogOut, AlertTriangle, ExternalLink } from 'lucide-react';
import { TablesView } from './components/TablesView';
import { POSView } from './components/POSView';
import { Dashboard } from './components/Dashboard';
import { SettingsView } from './components/SettingsView';
import { MenuView } from './components/MenuView';
import { StaffView } from './components/StaffView';
import { BillTemplate } from './components/BillTemplate';
import { ToastContainer } from './components/ToastContainer';
import { LoginView } from './components/LoginView';

// Firebase Imports
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, query, orderBy } from 'firebase/firestore';
import { auth, db, firebaseConfig } from './firebaseConfig';
import * as dbService from './services/db';

const App: React.FC = () => {
  // --- Check Configuration ---
  if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
        <div className="max-w-2xl w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-xl">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold">Firebase Setup Required</h1>
          </div>
          
          <div className="space-y-6 text-slate-300">
            <p>To run this application, you need to connect it to your own Firebase backend.</p>
            
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 space-y-4">
              <h3 className="font-bold text-white">Quick Start Guide:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to <a href="https://console.firebase.google.com" target="_blank" className="text-blue-400 hover:underline inline-flex items-center gap-1">Firebase Console <ExternalLink size={12}/></a> and create a project.</li>
                <li>Enable <strong>Authentication</strong> (Email/Password provider).</li>
                <li>Enable <strong>Firestore Database</strong> (Start in Test Mode).</li>
                <li>Go to Project Settings, create a Web App, and copy the config keys.</li>
                <li>Open <code className="bg-slate-950 px-2 py-1 rounded text-yellow-400">firebaseConfig.ts</code> in your code editor.</li>
                <li>Replace the placeholder values with your actual keys.</li>
              </ol>
            </div>

            <p className="text-sm italic opacity-70">
              Once you save the file with valid keys, this screen will disappear automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- Global State ---
  const [view, setView] = useState<ViewState>('tables');
  
  // Data State (Populated via Firestore listeners)
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Record<string, Order>>({}); 
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // --- 1. Auth & Data Seeding ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Only attempt to seed if logged in
        try {
            await dbService.seedDatabaseIfEmpty();
        } catch (e) {
            console.error("Seeding failed (permissions potentially):", e);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. Real-time Firestore Listeners ---
  useEffect(() => {
    if (!user) return;

    // Listen to Settings
    const unsubSettings = onSnapshot(doc(db, "settings", "store_config"), (doc) => {
      if (doc.exists()) setSettings(doc.data() as StoreSettings);
    });

    // Listen to Tables
    const qTables = query(collection(db, "tables"), orderBy("id"));
    const unsubTables = onSnapshot(qTables, (snapshot) => {
      const tList = snapshot.docs.map(d => d.data() as Table);
      setTables(tList);
    });

    // Listen to Menu
    const unsubMenu = onSnapshot(collection(db, "menu"), (snapshot) => {
      const mList = snapshot.docs.map(d => d.data() as MenuItem);
      setMenuItems(mList);
    });

    // Listen to Staff
    const unsubStaff = onSnapshot(collection(db, "staff"), (snapshot) => {
      const sList = snapshot.docs.map(d => d.data() as Staff);
      setStaff(sList);
    });

    // Listen to Orders
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const oMap: Record<string, Order> = {};
      snapshot.docs.forEach(d => {
        oMap[d.id] = d.data() as Order;
      });
      setOrders(oMap);
      setLoadingData(false);
    });

    return () => {
      unsubSettings();
      unsubTables();
      unsubMenu();
      unsubStaff();
      unsubOrders();
    };
  }, [user]);


  // --- Toast Logic ---
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Actions (Replaced with Firebase Calls) ---

  const handleSelectTable = (tableId: string) => {
    setActiveTableId(tableId);
    setView('pos');
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    try {
      // 1. Save Order
      await dbService.saveOrder(updatedOrder);
      
      // 2. Update Table Status if it was available
      const table = tables.find(t => t.id === updatedOrder.tableId);
      if (table && table.status === 'available') {
        await dbService.updateTableStatus(table.id, 'occupied', updatedOrder.id);
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to save order', 'error');
    }
  };

  const handleCompleteOrder = async (order: Order) => {
    try {
      const completedOrder: Order = { 
        ...order, 
        status: 'completed', 
        completedAt: Date.now() 
      };
      
      // 1. Update Order
      await dbService.saveOrder(completedOrder);
      
      // 2. Free up Table
      await dbService.updateTableStatus(order.tableId, 'available');

      setActiveTableId(null);
      setView('tables');
      showToast(`Order for Table ${order.tableId.replace('t', '')} completed!`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to complete order', 'error');
    }
  };

  // Update Menu (Firebase)
  const handleUpdateMenu = async (newMenu: MenuItem[]) => {
    // This prop logic is a bit different now since we rely on listeners.
    // However, the MenuView passes the whole array usually.
    // Ideally, MenuView should call add/delete/update single items.
    // For compatibility with existing MenuView prop structure, we will detect changes (naive approach) 
    // or better, modify MenuView to call individual actions. 
    // BUT, to keep changes minimal, we assume MenuView calls this with the *new state*.
    // Since syncing the whole array is inefficient, we will update MenuView to be smarter later.
    // For now, let's just loop and set (inefficient but works for small menus).
    
    // Actually, let's inject a smarter wrapper in the render method below
    // We will just let the child component handle state updates via a wrapper function that calls dbService
  };

  const handleUpdateStaff = async (newStaffList: Staff[]) => {
    // Similar to menu, we will rely on the child component calling the wrapper
  };

  // Handle Bill Actions
  const handlePrintBill = (order: Order) => {
    setPrintOrder(order);
  };

  const handleClosePrint = () => {
    setPrintOrder(null);
  };

  const handleUpdateDeliveryMethod = async (method: 'WhatsApp' | 'Printed', phone?: string) => {
    if (printOrder) {
       const updated = { 
          ...printOrder, 
          deliveryMethod: method,
          customerPhone: phone || printOrder.customerPhone 
       };
       // Optimistic update for UI (optional since listener is fast)
       setPrintOrder(updated);
       // Save to DB
       await dbService.saveOrder(updated);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  // --- Derived State for Views ---
  const activeTable = activeTableId ? tables.find(t => t.id === activeTableId) : null;
  const activeOrder = activeTable?.currentOrderId ? orders[activeTable.currentOrderId] : null;
  const allOrdersList = Object.values(orders);

  // Dynamic Categories from Menu Items
  const categories = ['All', ...Array.from(new Set(menuItems.map(i => i.category)))];

  // --- Render ---

  if (authLoading) return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  
  if (!user) return <LoginView />;

  if (loadingData) return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">Loading restaurant data...</div>;

  return (
    <div className="flex h-screen w-full bg-gray-50 text-slate-900 font-sans print:bg-white print:h-auto print:block overflow-hidden print:overflow-visible">
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col justify-between print:hidden flex-shrink-0 z-20">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              R
            </div>
            <span className="ml-3 font-bold text-lg text-gray-800">RestoBill AI</span>
          </div>

          <nav className="mt-6 px-4 space-y-2">
            <NavButton view="tables" current={view} icon={<Grid size={20} />} label="Tables" onClick={() => { setView('tables'); setActiveTableId(null); }} />
            <NavButton view="pos" current={view} icon={<Utensils size={20} />} label="POS (Active)" onClick={() => { if(activeTableId) setView('pos'); else showToast('Select a table first', 'error'); }} />
            <div className="border-t border-gray-100 my-2 pt-2"></div>
            <NavButton view="dashboard" current={view} icon={<LayoutDashboard size={20} />} label="Reports" onClick={() => { setView('dashboard'); setActiveTableId(null); }} />
            <NavButton view="menu" current={view} icon={<MenuIcon size={20} />} label="Menu" onClick={() => { setView('menu'); setActiveTableId(null); }} />
            <NavButton view="staff" current={view} icon={<Users size={20} />} label="Staff" onClick={() => { setView('staff'); setActiveTableId(null); }} />
            <NavButton view="settings" current={view} icon={<SettingsIcon size={20} />} label="Settings" onClick={() => { setView('settings'); setActiveTableId(null); }} />
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between px-3 py-2 text-gray-400 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                    <p className="text-xs font-medium text-gray-700 truncate w-24">{user.email}</p>
                </div>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500">
                <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative print:hidden overflow-hidden">
        {/* Mobile Header */}
        <header className="h-14 lg:hidden bg-white border-b border-gray-200 flex items-center px-4 justify-between z-10 flex-shrink-0">
          <div className="flex items-center space-x-2">
             <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">R</div>
             <span className="font-bold text-lg text-gray-800">RestoBill</span>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500">
             <LogOut size={18} />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 pb-20 lg:pb-0">
          {view === 'tables' && (
            <TablesView 
              tables={tables} 
              activeOrders={orders} 
              settings={settings}
              onSelectTable={handleSelectTable} 
            />
          )}

          {view === 'pos' && activeTable && (
            <div className="h-full">
              <POSView 
                activeTable={activeTable}
                activeOrder={activeOrder}
                menu={menuItems}
                categories={categories}
                settings={settings}
                onUpdateOrder={handleUpdateOrder}
                onCompleteOrder={handleCompleteOrder}
                onPrintBill={handlePrintBill}
                onExit={() => setView('tables')}
                isPrinting={printOrder !== null}
                showToast={showToast}
              />
            </div>
          )}

          {view === 'dashboard' && (
            <Dashboard 
              orders={allOrdersList} 
              menu={menuItems}
              settings={settings}
            />
          )}

          {view === 'menu' && (
            <MenuView 
              menu={menuItems}
              settings={settings}
              onUpdateMenu={(updatedMenu) => {
                 updatedMenu.forEach(item => {
                     dbService.saveMenuItem(item);
                 });
                 const currentIds = new Set(menuItems.map(i => i.id));
                 const newIds = new Set(updatedMenu.map(i => i.id));
                 
                 menuItems.forEach(i => {
                     if(!newIds.has(i.id)) dbService.deleteMenuItem(i.id);
                 });
                 updatedMenu.forEach(i => dbService.saveMenuItem(i));
              }}
              showToast={showToast}
            />
          )}

          {view === 'staff' && (
            <StaffView 
              staffList={staff}
              onUpdateStaff={(updatedStaff) => {
                 const newIds = new Set(updatedStaff.map(i => i.id));
                 staff.forEach(i => {
                     if(!newIds.has(i.id)) dbService.deleteStaff(i.id);
                 });
                 updatedStaff.forEach(i => dbService.saveStaff(i));
              }}
              showToast={showToast}
            />
          )}

          {view === 'settings' && (
            <SettingsView 
              settings={settings} 
              onUpdate={(newSettings) => dbService.saveSettings(newSettings)}
              onNavigateToStaff={() => setView('staff')}
              showToast={showToast}
            />
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex justify-around items-center z-30 pb-safe">
           <MobileNavButton view="tables" current={view} icon={<Grid size={20} />} label="Tables" onClick={() => { setView('tables'); setActiveTableId(null); }} />
           <MobileNavButton view="pos" current={view} icon={<Utensils size={20} />} label="POS" onClick={() => { if(activeTableId) setView('pos'); else showToast('Select a table', 'info'); }} />
           <MobileNavButton view="dashboard" current={view} icon={<LayoutDashboard size={20} />} label="Reports" onClick={() => { setView('dashboard'); setActiveTableId(null); }} />
           <MobileNavButton view="menu" current={view} icon={<MenuIcon size={20} />} label="Menu" onClick={() => { setView('menu'); setActiveTableId(null); }} />
           <MobileNavButton view="settings" current={view} icon={<SettingsIcon size={20} />} label="More" onClick={() => { setView('settings'); setActiveTableId(null); }} />
        </nav>
      </main>

      {/* Print Overlay */}
      {printOrder && (
        <BillTemplate 
          order={printOrder} 
          settings={settings} 
          tableId={printOrder.tableId} 
          onClose={handleClosePrint}
          onUpdateDeliveryMethod={handleUpdateDeliveryMethod}
        />
      )}
      
    </div>
  );
};

// Helper for Desktop Nav
const NavButton: React.FC<{ view: string; current: string; icon: React.ReactNode; label: string; onClick: () => void }> = ({ view, current, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${
      current === view ? 'bg-blue-50 text-primary font-medium' : 'text-gray-500 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Helper for Mobile Nav
const MobileNavButton: React.FC<{ view: string; current: string; icon: React.ReactNode; label: string; onClick: () => void }> = ({ view, current, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
      current === view ? 'text-primary' : 'text-gray-400'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default App;