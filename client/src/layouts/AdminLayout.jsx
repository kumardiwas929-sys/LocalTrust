import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileCheck2,
  FolderTree,
  Wrench,
  CalendarCheck,
  Navigation,
  AlertTriangle,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice.js';
import Toast from '../components/common/Toast.jsx';
import CallModal from '../components/calling/CallModal.jsx';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { label: 'Admin Metrics', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Provider Verifications', path: '/admin/verifications', icon: FileCheck2 },
    { label: 'All Users', path: '/admin/users', icon: Users },
    { label: 'Service Providers', path: '/admin/providers', icon: Briefcase },
    { label: 'Service Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Platform Services', path: '/admin/services', icon: Wrench },
    { label: 'All Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { label: 'Live Journey Map', path: '/admin/live-tracking', icon: Navigation },
    { label: 'Disputes & Tickets', path: '/admin/disputes', icon: AlertTriangle },
    { label: 'Security Audit Logs', path: '/admin/audit-logs', icon: History },
  ];

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-navy-950 text-slate-300">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-navy-900 gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              Local<span className="text-purple-400">Trust</span>
            </span>
            <span className="block text-[10px] font-semibold text-purple-300 -mt-1 uppercase tracking-wider">
              Super Admin
            </span>
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
                    ? 'bg-purple-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-navy-900 bg-black/30">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-purple-300 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-navy-900 transition-colors"
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
              {navLinks.find((l) => l.path === location.pathname)?.label || 'System Administration'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Security Level: Master
            </span>
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
          <div className="relative w-72 max-w-full bg-navy-950 text-slate-300 h-full flex flex-col shadow-2xl">
            <div className="h-16 flex items-center justify-between px-6 border-b border-navy-900">
              <span className="font-extrabold text-lg text-white">LocalTrust Admin</span>
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
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-navy-900"
                >
                  <item.icon className="w-4 h-4 text-slate-400" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-navy-900">
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

export default AdminLayout;
