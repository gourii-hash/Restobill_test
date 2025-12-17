import React, { useState } from 'react';
import { Staff } from '../types';
import { Plus, Edit2, Trash2, X, Save, Phone, Mail, CheckCircle2, XCircle } from 'lucide-react';

interface StaffViewProps {
  staffList: Staff[];
  onUpdateStaff: (staff: Staff[]) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const StaffView: React.FC<StaffViewProps> = ({ staffList, onUpdateStaff, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '',
    role: 'Waiter',
    phone: '',
    email: '',
    status: 'present'
  });

  const handleOpenModal = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData(staff);
    } else {
      setEditingStaff(null);
      setFormData({ name: '', role: 'Waiter', phone: '', email: '', status: 'present' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      const updatedList = staffList.filter(s => s.id !== id);
      onUpdateStaff(updatedList);
      showToast('Staff member removed', 'success');
    }
  };

  const toggleStatus = (staff: Staff) => {
    // Fix: Explicitly type newStatus as 'present' | 'absent' to satisfy Staff interface
    const newStatus: 'present' | 'absent' = staff.status === 'present' ? 'absent' : 'present';
    const updatedList = staffList.map(s => s.id === staff.id ? { ...s, status: newStatus } : s);
    onUpdateStaff(updatedList);
    showToast(`Marked ${staff.name} as ${newStatus}`, 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) {
      showToast('Name and Role are required', 'error');
      return;
    }

    if (editingStaff) {
      // Update
      const updatedList = staffList.map(s => s.id === editingStaff.id ? { ...s, ...formData } as Staff : s);
      onUpdateStaff(updatedList);
      showToast('Staff updated successfully', 'success');
    } else {
      // Add
      const newStaff: Staff = {
        ...(formData as any), // Spread first to allow defaults to be overwritten by explicit values below
        id: crypto.randomUUID(),
        joinedAt: Date.now(),
        status: 'present'
      };
      onUpdateStaff([...staffList, newStaff]);
      showToast('Staff added successfully', 'success');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span className="hidden md:inline">Add Staff</span>
          <span className="md:hidden">Add</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {staffList.map(staff => (
          <div key={staff.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col group hover:shadow-md transition-shadow relative overflow-hidden">
            {/* Status Indicator Stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${staff.status === 'present' ? 'bg-green-500' : 'bg-gray-300'}`}></div>

            <div className="flex justify-between items-start mb-4 pl-3">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${staff.status === 'present' ? 'bg-primary' : 'bg-gray-400'}`}>
                  {staff.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{staff.name}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{staff.role}</span>
                </div>
              </div>
              <div className="flex space-x-1">
                <button 
                  onClick={() => handleOpenModal(staff)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(staff.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2 mt-auto pl-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Phone size={14} />
                <span>{staff.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Mail size={14} />
                <span>{staff.email || 'No email'}</span>
              </div>
              
              <div className="pt-3 mt-3 border-t border-gray-50 flex justify-between items-center">
                <button 
                  onClick={() => toggleStatus(staff)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                     staff.status === 'present' 
                     ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                     : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {staff.status === 'present' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  <span className="uppercase">{staff.status}</span>
                </button>
                <span className="text-[10px] text-gray-400">Since {new Date(staff.joinedAt).getFullYear()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                {editingStaff ? 'Edit Staff' : 'Add Staff Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="Manager">Manager</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Chef">Chef</option>
                  <option value="Cashier">Cashier</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center space-x-2 bg-primary text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  <Save size={18} />
                  <span>{editingStaff ? 'Save Changes' : 'Add Staff'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};