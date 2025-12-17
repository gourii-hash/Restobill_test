import React, { useState } from 'react';
import { MenuItem, StoreSettings } from '../types';
import { Plus, Edit2, Trash2, X, Save, Search, Utensils, ChevronDown } from 'lucide-react';

interface MenuViewProps {
  menu: MenuItem[];
  settings: StoreSettings;
  onUpdateMenu: (menu: MenuItem[]) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const MenuView: React.FC<MenuViewProps> = ({ menu, settings, onUpdateMenu, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    price: 0,
    category: 'Main Course',
    description: ''
  });

  const categories = Array.from(new Set(menu.map(i => i.category)));

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
      setIsCustomCategory(false);
    } else {
      setEditingItem(null);
      setFormData({ name: '', price: 0, category: categories[0] || 'Main Course', description: '' });
      setIsCustomCategory(false);
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedMenu = menu.filter(i => i.id !== id);
      onUpdateMenu(updatedMenu);
      showToast('Item deleted successfully', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      showToast('Please fill in name, price and category', 'error');
      return;
    }

    if (editingItem) {
      // Update
      const updatedMenu = menu.map(i => i.id === editingItem.id ? { ...i, ...formData } as MenuItem : i);
      onUpdateMenu(updatedMenu);
      showToast('Item updated successfully', 'success');
    } else {
      // Add
      const newItem: MenuItem = {
        costPrice: 0, // Default value as it's required by type but not in form
        ...(formData as any), // Spread first to allow overwriting if needed, cast to any to avoid TS conflict
        id: crypto.randomUUID(),
      };
      onUpdateMenu([...menu, newItem]);
      showToast('Item added successfully', 'success');
    }
    setIsModalOpen(false);
  };

  const filteredMenu = menu.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Menu Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-primary text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span className="hidden md:inline">Add Item</span>
          <span className="md:hidden">Add</span>
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center space-x-4">
            <Search className="text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 w-full text-gray-600 placeholder-gray-400"
            />
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Desktop Table */}
          <table className="w-full text-left text-sm hidden md:table">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 sticky top-0">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMenu.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">{settings.currency}{item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{item.description}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
             {filteredMenu.map(item => (
               <div key={item.id} className="p-4 hover:bg-gray-50 flex justify-between items-start">
                  <div className="flex-1 pr-4">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] uppercase">{item.category}</span>
                     </div>
                     <p className="text-xs text-gray-500 line-clamp-1 mb-1">{item.description}</p>
                     <p className="text-sm font-bold text-gray-900">{settings.currency}{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-gray-500 bg-gray-100 rounded hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-500 bg-gray-100 rounded hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                  </div>
               </div>
             ))}
          </div>

          {filteredMenu.length === 0 && (
            <div className="flex flex-col items-center justify-center space-y-2 py-12 text-gray-400">
              <Utensils size={48} className="opacity-20" />
              <p>No items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                {editingItem ? 'Edit Item' : 'New Menu Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="e.g. Butter Chicken"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                   {!isCustomCategory ? (
                     <div className="relative">
                        <select
                          value={formData.category}
                          onChange={e => {
                            if (e.target.value === 'custom_new') {
                              setIsCustomCategory(true);
                              setFormData({ ...formData, category: '' });
                            } else {
                              setFormData({ ...formData, category: e.target.value });
                            }
                          }}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none bg-white"
                        >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                          <option value="custom_new">+ Create New...</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                     </div>
                   ) : (
                     <div className="flex gap-2">
                        <input 
                          type="text"
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                          placeholder="Type category..."
                          autoFocus
                        />
                        <button 
                          type="button"
                          onClick={() => { setIsCustomCategory(false); setFormData({...formData, category: categories[0] || 'Main Course'}); }}
                          className="p-2 text-gray-500 hover:text-gray-700"
                        >
                          <X size={18} />
                        </button>
                     </div>
                   )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none h-24"
                  placeholder="Ingredients, allergies, etc."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center space-x-2 bg-primary text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  <Save size={18} />
                  <span>{editingItem ? 'Save Changes' : 'Create Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};