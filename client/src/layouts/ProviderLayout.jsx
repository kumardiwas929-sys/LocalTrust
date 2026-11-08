import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  CalendarCheck,
  Wrench,
  Clock,
  DollarSign,
  ShieldCheck,
  Star,
  MessageSquare,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  FileCheck2,
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice.js';
import Toast from '../components/common/Toast.jsx';
import CallModal from '../components/calling/CallModal.jsx';
import Badge from '../components/common/Badge.jsx';

const ProviderLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, providerProfile } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { label: 'Provider Overview', path: '/provider/dashboard', icon: LayoutDashboard },
    { label: 'Booking Requests & Jobs', path: '/provider/jobs', icon: CalendarCheck },
    { label: 'My Services', path: '/provider/services', icon: Wrench },
    { label: 'Working Schedule', path: '/provider/availability', icon: Clock },
    { label: 'Earnings & Payouts', path: '/provider/earnings', icon: DollarSign },
    { label: 'Trust Passport™', path: '/provider/trust-passport', icon: ShieldCheck },
    { label: 'Verification & KYC', path: '/provider/verification', icon: FileCheck2 },
    { label: 'Client Reviews', path: '/provider/reviews', icon: Star },
    { label: 'Messages', path: '/provider/messages', icon: MessageSquare },
    { label: 'Business Profile', path: '/provider/profile', icon: User },
  ];

  const isVerified = providerProfile?.verificationStatus === 'verified';

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 text-slate-300">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              Local<span className="text-teal-400">Trust</span>
            </span>
            <span className="block text-[10px] font-semibold text-slate-400 -mt-1">Provider Center</span>
          </div>
        </div>

        {/* Verification Status Pill */}
        <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <Badge variant={isVerified ? 'verified' : 'warning'} showVerifiedIcon={isVerified}>
              {isVerified ? 'Verified Pro' : 'Pending Verification'}
            </Badge>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0 border border-teal-500/30">
                {user?.name?.charAt(0) || 'P'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{providerProfile?.businessName || user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              {navLinks.find((l) => l.path === location.pathname)?.label || 'Provider Workspace'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/provider/messages"
              className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg relative"
            >
              <MessageSquare className="w-5 h-5" />
            </Link>
            <div className="relative">
              <button className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 max-w-full bg-slate-900 text-slate-300 h-full flex flex-col shadow-2xl">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
              <span className="font-extrabold text-lg text-white">LocalTrust Provider</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  <item.icon className="w-4 h-4 text-slate-400" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-sm text-rose-400 font-semibold py-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast />
      <CallModal />
    </div>
  );
};

export default ProviderLayout;
