import { db } from "../firebaseConfig";
import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, writeBatch } from "firebase/firestore";
import { Order, Table, MenuItem, Staff, StoreSettings } from "../types";
import { TABLES, MENU_ITEMS, INITIAL_SETTINGS, INITIAL_STAFF } from "../constants";

// --- Seeding ---
// This function checks if data exists, if not, it uploads the constants
export const seedDatabaseIfEmpty = async () => {
  const tableSnap = await getDocs(collection(db, "tables"));
  if (!tableSnap.empty) return; // Already seeded

  console.log("Seeding database...");
  const batch = writeBatch(db);

  // Seed Tables
  TABLES.forEach(table => {
    const ref = doc(db, "tables", table.id);
    batch.set(ref, table);
  });

  // Seed Menu
  MENU_ITEMS.forEach(item => {
    const ref = doc(db, "menu", item.id);
    batch.set(ref, item);
  });

  // Seed Staff
  INITIAL_STAFF.forEach(staff => {
    const ref = doc(db, "staff", staff.id);
    batch.set(ref, staff);
  });

  // Seed Settings
  const settingsRef = doc(db, "settings", "store_config");
  batch.set(settingsRef, INITIAL_SETTINGS);

  await batch.commit();
  console.log("Database seeded!");
};

// --- Orders ---
export const saveOrder = async (order: Order) => {
  await setDoc(doc(db, "orders", order.id), order, { merge: true });
};

// --- Tables ---
export const updateTableStatus = async (tableId: string, status: 'available' | 'occupied', orderId?: string) => {
  await updateDoc(doc(db, "tables", tableId), {
    status,
    currentOrderId: orderId || null
  });
};

// --- Menu ---
export const saveMenuItem = async (item: MenuItem) => {
  await setDoc(doc(db, "menu", item.id), item);
};

export const deleteMenuItem = async (id: string) => {
  await deleteDoc(doc(db, "menu", id));
};

// --- Staff ---
export const saveStaff = async (staff: Staff) => {
  await setDoc(doc(db, "staff", staff.id), staff);
};

export const deleteStaff = async (id: string) => {
  await deleteDoc(doc(db, "staff", id));
};

// --- Settings ---
export const saveSettings = async (settings: StoreSettings) => {
  await setDoc(doc(db, "settings", "store_config"), settings);
};