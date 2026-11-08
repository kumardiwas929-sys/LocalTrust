import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShieldCheck,
  Bell,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  CalendarCheck,
  Search,
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice.js';
import { setNotifications } from '../../redux/slices/notificationSlice.js';
import api from '../../services/api.js';
import Button from './Button.jsx';
import Badge from './Badge.jsx';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, providerProfile } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Fetch unread notifications if authenticated
  useEffect(() => {
    if (isAuthenticated) {
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
        .catch(() => {});
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    dispatch(logout());
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'provider') return '/provider/dashboard';
    return '/customer/dashboard';
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-navy-900 group-hover:text-brand-600 transition-colors">
                Local<span className="text-brand-600">Trust</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider -mt-1 hidden sm:inline">
                Verified Services
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link to="/services" className="hover:text-brand-600 transition-colors flex items-center gap-1.5">
              <Search className="w-4 h-4 text-slate-400" />
              Find Services
            </Link>
            <Link to="/how-it-works" className="hover:text-brand-600 transition-colors">
              How It Works
            </Link>
            <Link to="/about" className="hover:text-brand-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-brand-600 transition-colors">
              Support
            </Link>
            {!isAuthenticated && (
              <Link
                to="/become-provider"
                className="text-teal-600 hover:text-teal-700 font-semibold transition-colors flex items-center gap-1"
              >
                Become a Provider
              </Link>
            )}
          </div>

          {/* User Controls / Auth CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Messages icon */}
                <Link
                  to={user.role === 'provider' ? '/provider/messages' : '/customer/messages'}
                  className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors relative"
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Notifications bell */}
                <Link
                  to={user.role === 'customer' ? '/customer/notifications' : getDashboardLink()}
                  className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Role badge */}
                <Badge
                  variant={user.role === 'admin' ? 'purple' : user.role === 'provider' ? 'teal' : 'info'}
                  className="capitalize"
                >
                  {user.role}
                </Badge>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 text-sm font-medium transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs overflow-hidden border border-brand-200">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <span className="max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-premium border border-slate-100 py-1.5 z-50 text-sm">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      <Link
                        to={getDashboardLink()}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Dashboard
                      </Link>

                      {user.role === 'customer' && (
                        <Link
                          to="/customer/bookings"
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <CalendarCheck className="w-4 h-4 text-slate-400" />
                          My Bookings
                        </Link>
                      )}

                      {user.role === 'provider' && (
                        <Link
                          to="/provider/jobs"
                          className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <CalendarCheck className="w-4 h-4 text-slate-400" />
                          Job Requests
                        </Link>
                      )}

                      <Link
                        to={user.role === 'provider' ? '/provider/profile' : '/customer/profile'}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Profile Settings
                      </Link>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 font-medium text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link to="/services" className="block py-2 text-slate-700 font-medium">
            Find Services
          </Link>
          <Link to="/how-it-works" className="block py-2 text-slate-700 font-medium">
            How It Works
          </Link>
          <Link to="/about" className="block py-2 text-slate-700 font-medium">
            About LocalTrust
          </Link>
          <Link to="/contact" className="block py-2 text-slate-700 font-medium">
            Customer Support
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link to={getDashboardLink()} className="block py-2 text-brand-600 font-semibold">
                Go to Dashboard ({user.role})
              </Link>
              <button onClick={handleLogout} className="block w-full text-left py-2 text-rose-600 font-medium">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link to="/register" className="w-full">
                <Button variant="primary" className="w-full">
                  Create Free Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
