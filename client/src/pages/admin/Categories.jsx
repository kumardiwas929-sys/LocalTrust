import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, CheckCircle, Trash2, Edit } from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import { showToast } from '../../redux/slices/notificationSlice.js';
import { useDispatch } from 'react-redux';

const AdminCategories = () => {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Zap');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    api
      .get('/categories?all=true')
      .then((res) => {
        if (res?.data) setCategories(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post('/categories', { name, description, icon });
      dispatch(showToast({ type: 'success', message: 'Category created successfully!' }));
      setModalOpen(false);
      setName('');
      setDescription('');
      fetchCategories();
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Creation failed' }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      if (cat.isActive) {
        await api.delete(`/categories/${cat._id}`);
      } else {
        await api.put(`/categories/${cat._id}`, { isActive: true });
      }
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Service Categories</h1>
          <p className="text-xs text-slate-500">
            Configure marketplace domains, icons, and searchable category classifications.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setModalOpen(true)}>
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-500 uppercase">{c.slug}</span>
                <Badge variant={c.isActive ? 'success' : 'danger'}>
                  {c.isActive ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleToggleStatus(c)}
                className={`text-xs font-semibold ${c.isActive ? 'text-rose-600' : 'text-emerald-600'}`}
              >
                {c.isActive ? 'Disable Category' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Category">
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Solar Panel Maintenance"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of repairs covered under this domain..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading}>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategories;
