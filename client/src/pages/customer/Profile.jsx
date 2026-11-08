import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Phone, MapPin, Plus, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import { updateUserData } from '../../redux/slices/authSlice.js';
import { showToast } from '../../redux/slices/notificationSlice.js';

const CustomerProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [profileLoading, setProfileLoading] = useState(false);

  // Address Modal State
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [label, setLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Noida');
  const [stateName, setStateName] = useState('Uttar Pradesh');
  const [postalCode, setPostalCode] = useState('201301');
  const [isDefault, setIsDefault] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const res = await api.put('/users/profile', { name, phone });
      if (res?.data) {
        dispatch(updateUserData({ name: res.data.name, phone: res.data.phone }));
        dispatch(showToast({ type: 'success', message: 'Profile updated successfully!' }));
      }
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Update failed' }));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      setAddressLoading(true);
      const res = await api.post('/users/addresses', {
        label,
        street,
        city,
        state: stateName,
        postalCode,
        isDefault,
      });

      if (res?.data) {
        setAddresses(res.data);
        dispatch(updateUserData({ addresses: res.data }));
        dispatch(showToast({ type: 'success', message: 'Address saved!' }));
        setAddressModalOpen(false);
        setStreet('');
      }
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Could not save address' }));
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await api.delete(`/users/addresses/${id}`);
      if (res?.data) {
        setAddresses(res.data);
        dispatch(updateUserData({ addresses: res.data }));
        dispatch(showToast({ type: 'info', message: 'Address removed' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Account & Addresses</h1>
        <p className="text-xs text-slate-500">Manage your contact information and saved service locations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-5">
          <h3 className="text-base font-bold text-slate-900">Personal Information</h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Verified)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="sm" isLoading={profileLoading}>
              Save Profile Changes
            </Button>
          </form>
        </div>

        {/* Addresses Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Saved Addresses</h3>
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setAddressModalOpen(true)}
            >
              Add New
            </Button>
          </div>

          <div className="space-y-3">
            {addresses.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 italic">No saved addresses yet.</p>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="p-3.5 rounded-2xl border border-slate-200 flex items-start justify-between gap-3 bg-slate-50/50"
                >
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 mt-0.5">{addr.street}</p>
                      <p className="text-slate-400">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="Remove address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Add New Service Address"
      >
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address Label</label>
            <select
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Parent's Home">Parent's Home</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
            <input
              type="text"
              required
              placeholder="Flat/House number, building, sector, street..."
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <span>Set as default service address</span>
          </label>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={addressLoading}>
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerProfile;
