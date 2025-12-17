
import { MenuItem, Table, StoreSettings, Staff, Order, OrderItem } from './types';

export const INITIAL_SETTINGS: StoreSettings = {
  name: 'Spice Garden',
  address: '42 Masala Street, New Delhi, 110001',
  gstRate: 5,
  serviceChargeRate: 5,
  currency: '₹',
  phone: '+91 98765 43210'
};

export const MENU_ITEMS: MenuItem[] = [
  // Starters (Approx 30-40% Cost)
  { id: '1', name: 'Paneer Tikka', price: 240, costPrice: 90, category: 'Starters', description: 'Marinated cottage cheese grilled in tandoor' },
  { id: '2', name: 'Chicken Tikka', price: 280, costPrice: 110, category: 'Starters', description: 'Spicy marinated chicken chunks' },
  { id: '3', name: 'Veg Manchurian', price: 180, costPrice: 60, category: 'Starters', description: 'Vegetable balls in spicy chinese sauce' },
  { id: '4', name: 'Samosa (2pcs)', price: 40, costPrice: 12, category: 'Starters', description: 'Crispy pastry filled with spiced potatoes' },
  
  // Main Course
  { id: '5', name: 'Butter Chicken', price: 350, costPrice: 140, category: 'Main Course', description: 'Classic chicken in rich tomato butter gravy' },
  { id: '6', name: 'Dal Makhani', price: 220, costPrice: 80, category: 'Main Course', description: 'Creamy black lentils slow cooked overnight' },
  { id: '7', name: 'Paneer Butter Masala', price: 260, costPrice: 95, category: 'Main Course', description: 'Cottage cheese in rich tomato gravy' },
  { id: '8', name: 'Kadai Chicken', price: 320, costPrice: 130, category: 'Main Course', description: 'Chicken cooked with bell peppers and spices' },
  
  // Breads & Rice
  { id: '9', name: 'Garlic Naan', price: 55, costPrice: 15, category: 'Breads', description: 'Leavened bread topped with garlic' },
  { id: '10', name: 'Butter Roti', price: 35, costPrice: 8, category: 'Breads', description: 'Whole wheat bread with butter' },
  { id: '11', name: 'Chicken Biryani', price: 280, costPrice: 120, category: 'Rice', description: 'Aromatic basmati rice cooked with spiced chicken' },
  { id: '12', name: 'Jeera Rice', price: 140, costPrice: 40, category: 'Rice', description: 'Basmati rice tempered with cumin seeds' },
  
  // South Indian
  { id: '13', name: 'Masala Dosa', price: 120, costPrice: 45, category: 'South Indian', description: 'Crispy rice crepe filled with potato masala' },
  { id: '14', name: 'Idli Sambar', price: 80, costPrice: 25, category: 'South Indian', description: 'Steamed rice cakes with lentil soup' },

  // Beverages & Desserts
  { id: '15', name: 'Masala Chai', price: 30, costPrice: 8, category: 'Beverages', description: 'Spiced indian tea' },
  { id: '16', name: 'Sweet Lassi', price: 80, costPrice: 25, category: 'Beverages', description: 'Chilled yogurt drink' },
  { id: '17', name: 'Gulab Jamun', price: 60, costPrice: 20, category: 'Dessert', description: 'Deep fried milk dumplings in sugar syrup' },
];

export const TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: `t${i + 1}`,
  name: `Table ${i + 1}`,
  capacity: 4,
  status: 'available'
}));

export const INITIAL_STAFF: Staff[] = [
  { id: 's1', name: 'Rahul Sharma', role: 'Manager', phone: '98765-00001', joinedAt: Date.now(), status: 'present' },
  { id: 's2', name: 'Priya Singh', role: 'Waiter', phone: '98765-00002', joinedAt: Date.now(), status: 'present' },
  { id: 's3', name: 'Amit Kumar', role: 'Chef', phone: '98765-00003', joinedAt: Date.now(), status: 'absent' },
];

export const CATEGORIES = ['All', ...Array.from(new Set(MENU_ITEMS.map(i => i.category)))];

// --- Mock Data Generator ---

const CUSTOMER_POOL = [
  { name: 'Amit Patel', phone: '9876543210' },
  { name: 'Sneha Gupta', phone: '9812345678' },
  { name: 'Rahul Roy', phone: '9988776655' },
  { name: 'Priya Sharma', phone: '9123456789' },
  { name: 'Vikram Singh', phone: '9567891234' },
  { name: 'Anjali Desai', phone: '9876512345' },
  { name: 'Karan Malhotra', phone: '9001122334' },
  { name: 'Riya Kapoor', phone: '9998887776' },
  { name: 'Arjun Reddy', phone: '9554433221' },
  { name: 'Neha Khanna', phone: '9112233445' },
  { name: 'Siddharth Jain', phone: '9887766554' },
  { name: 'Pooja Verma', phone: '9776655443' },
  { name: 'Rohan Mehta', phone: '9665544332' },
  { name: 'Ishaan Gupta', phone: '9554433221' },
  { name: 'Aditya Kumar', phone: '9443322110' },
];

export const GENERATE_DEMO_DATA = (): Record<string, Order> => {
  const orders: Record<string, Order> = {};
  const today = new Date();
  
  // Generate data for past 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random number of orders per day (5 to 15)
    const ordersCount = Math.floor(Math.random() * 10) + 5;

    for (let j = 0; j < ordersCount; j++) {
      const orderId = `demo_${i}_${j}`;
      
      // Random hour between 11:00 and 23:00
      date.setHours(Math.floor(Math.random() * 12) + 11, Math.floor(Math.random() * 60));
      
      // Generate items
      const itemsCount = Math.floor(Math.random() * 5) + 1;
      const orderItems: OrderItem[] = [];
      let subtotal = 0;

      for (let k = 0; k < itemsCount; k++) {
        const menuItem = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        
        orderItems.push({
          id: `item_${k}`,
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: quantity
        });
        subtotal += menuItem.price * quantity;
      }

      const taxAmount = (subtotal * 5) / 100;
      const serviceChargeAmount = (subtotal * 5) / 100;
      const total = subtotal + taxAmount + serviceChargeAmount;

      // Random attributes
      const paymentMode = Math.random() > 0.6 ? 'UPI' : (Math.random() > 0.5 ? 'Card' : 'Cash');
      const deliveryMethod = Math.random() > 0.7 ? 'WhatsApp' : (Math.random() > 0.4 ? 'Printed' : 'None');
      
      // Pick random customer
      const customer = CUSTOMER_POOL[Math.floor(Math.random() * CUSTOMER_POOL.length)];

      // Fix: Added missing orderType property to satisfy Order interface
      orders[orderId] = {
        id: orderId,
        tableId: `t${Math.floor(Math.random() * 12) + 1}`,
        items: orderItems,
        status: 'completed',
        createdAt: date.getTime() - 3600000, // created 1 hour before completion
        completedAt: date.getTime(),
        subtotal,
        taxAmount,
        serviceChargeAmount,
        discountAmount: 0,
        total,
        orderType: Math.random() > 0.2 ? 'eat-in' : 'takeaway',
        paymentMode: paymentMode as any,
        deliveryMethod: deliveryMethod as any,
        customerName: customer.name,
        customerPhone: customer.phone,
      };
    }
  }
  return orders;
};
