import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import { showToast } from '../../redux/slices/notificationSlice.js';
import { useDispatch } from 'react-redux';

const ProviderAvailability = () => {
  const dispatch = useDispatch();
  const [workingDays, setWorkingDays] = useState([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('19:00');
  const [isTemporarilyUnavailable, setIsTemporarilyUnavailable] = useState(false);
  const [unavailableReason, setUnavailableReason] = useState('');
  const [loading, setLoading] = useState(false);

  const allDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const handleToggleDay = (day) => {
    if (workingDays.includes(day)) {
      if (workingDays.length > 1) {
        setWorkingDays(workingDays.filter((d) => d !== day));
      }
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/providers/availability', {
        workingDays,
        startTime,
        endTime,
        isTemporarilyUnavailable,
        unavailableReason,
      });
      dispatch(showToast({ type: 'success', message: 'Availability schedule updated!' }));
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.message || 'Update failed' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Working Schedule & Hours</h1>
        <p className="text-xs text-slate-500">
          Set your operating calendar to prevent double-booking and schedule clashes.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Working Days */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Active Working Days
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {allDays.map((day) => {
                const isSelected = workingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/60 text-brand-700'
                        : 'border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span>{day}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Shift Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Shift End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Temporary Unavailability Toggle */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isTemporarilyUnavailable}
                onChange={(e) => setIsTemporarilyUnavailable(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-bold text-slate-800">
                Mark Temporarily Unavailable (Vacation / Sick Leave)
              </span>
            </label>

            {isTemporarilyUnavailable && (
              <textarea
                rows={2}
                value={unavailableReason}
                onChange={(e) => setUnavailableReason(e.target.value)}
                placeholder="Notice to customers (e.g. Back on Tuesday next week)..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" variant="primary" size="md" isLoading={loading}>
              Save Availability Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderAvailability;
