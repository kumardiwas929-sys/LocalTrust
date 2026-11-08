import React, { useState, useEffect } from 'react';
import { Plus, Wrench, Edit, Trash2, CheckCircle } from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import { showToast } from '../../redux/slices/notificationSlice.js';
import { useDispatch } from 'react-redux';

const ProviderServices = () => {
  const dispatch = useDispatch();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [pricingType, setPricingType] = useState('fixed');
  const [basePrice, setBasePrice] = useState(350);
  const [hourlyRate, setHourlyRate] = useState(300);
  const [inspectionFee, setInspectionFee] = useState(100);
  const [serviceAreas, setServiceAreas] = useState('Noida, Delhi NCR');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const [servRes, catRes] = await Promise.all([
        api.get('/services?all=true'),
        api.get('/categories'),
      ]);
      if (servRes?.data) setServices(servRes.data);
      if (catRes?.data) {
        setCategories(catRes.data);
        if (catRes.data.length > 0) setCategoryId(catRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setEditingServiceId(null);
    setName('');
    setDescription('');
    setBasePrice(350);
    setPricingType('fixed');
    setModalOpen(true);
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = {
        name,
        description,
        categoryId,
        pricingType,
        basePrice: Number(basePrice),
        hourlyRate: Number(hourlyRate),
        inspectionFee: Number(inspectionFee),
        serviceAreas: serviceAreas.split(',').map((s) => s.trim()),
        photos: [photoUrl],
      };

      if (editingServiceId) {
        await api.put(`/services/${editingServiceId}`, payload);
        dispatch(showToast({ type: 'success', message: 'Service updated successfully!' }));
      } else {
        await api.post('/services', payload);
        dispatch(showToast({ type: 'success', message: 'Service listed successfully!' }));
      }

      setModalOpen(false);
      fetchServices();
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Operation failed' }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteService = async (id) => {
    try {
      await api.delete(`/services/${id}`);
      dispatch(showToast({ type: 'info', message: 'Service unlisted' }));
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">My Listed Services</h1>
          <p className="text-xs text-slate-500">
            Define pricing, estimated duration, and service areas for transparent customer discovery.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
          List New Service
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
          You haven't listed any services yet. Click 'List New Service' to start receiving bookings!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="h-36 rounded-xl bg-slate-100 overflow-hidden mb-3">
                  <img
                    src={s.photos?.[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'}
                    alt={s.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>{s.categoryId?.name}</span>
                  <Badge variant="navy" className="capitalize">{s.pricingType}</Badge>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{s.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{s.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Rate</span>
                  <span className="font-extrabold text-slate-900 text-base">₹{s.basePrice}</span>
                </div>
                <button
                  onClick={() => handleDeleteService(s._id)}
                  className="text-slate-400 hover:text-rose-500 p-1.5 rounded"
                  title="Delete service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingServiceId ? 'Edit Listed Service' : 'List a New Service'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmitService} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Inverter AC Jet Foam Servicing"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pricing Model</label>
            <select
              value={pricingType}
              onChange={(e) => setPricingType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="fixed">Fixed Rate</option>
              <option value="hourly">Hourly Rate</option>
              <option value="inspection">Inspection + On-Site Quote</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Base Price / Quoted (₹) *</label>
              <input
                type="number"
                min="0"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Doorstep Inspection Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={inspectionFee}
                onChange={(e) => setInspectionFee(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is included in this service package? (e.g. Gas pressure check, jet wash, parts safety inspect)..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading}>
              Save Service
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProviderServices;
