import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, CheckCheck, Clock, ShieldCheck, MessageSquare, AlertTriangle } from 'lucide-react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import {
  setNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../redux/slices/notificationSlice.js';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  const fetchNotifs = () => {
    api
      .get('/notifications')
      .then((res) => {
        if (res?.data) {
          dispatch(
            setNotifications({
              notifications: res.data,
              unreadCount: res.unreadCount || 0,
            })
          );
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      dispatch(markAllNotificationsAsRead());
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      dispatch(markNotificationAsRead(id));
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'tracking':
        return <Clock className="w-4 h-4 text-emerald-600" />;
      case 'booking':
        return <ShieldCheck className="w-4 h-4 text-brand-600" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-teal-600" />;
      case 'dispute':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500">Live booking milestones, calls, and arrival alerts.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="You have no notifications at the moment."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleMarkOneRead(n._id)}
              className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                n.isRead ? 'bg-white' : 'bg-brand-50/40 hover:bg-brand-50/70'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                {getTypeIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
              </div>
              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
