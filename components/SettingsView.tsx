import React from 'react';
import { StoreSettings } from '../types';
import { Save, Users, ChevronRight } from 'lucide-react';

interface SettingsViewProps {
  settings: StoreSettings;
  onUpdate: (settings: StoreSettings) => void;
  onNavigateToStaff: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate, onNavigateToStaff, showToast }) => {
  const [formData, setFormData] = React.useState<StoreSettings>(settings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Rate') ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    showToast('Settings saved successfully!', 'success');
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      
      {/* Quick Links Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="px-6 py-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700">Quick Actions</h3>
        <div className="divide-y divide-gray-100">
          <button 
            onClick={onNavigateToStaff}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3 text-gray-800">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <Users size={20} />
              </div>
              <div>
                <span className="font-medium block">Staff Management</span>
                <span className="text-xs text-gray-500">Add staff, mark attendance</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Settings Form */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Store Settings</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
              <input
                type="number"
                name="gstRate"
                value={formData.gstRate}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Charge (%)</label>
              <input
                type="number"
                name="serviceChargeRate"
                value={formData.serviceChargeRate}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
            <input
              type="text"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="flex items-center justify-center space-x-2 w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <Save size={20} />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};