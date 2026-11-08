import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice.js';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    dispatch(loginStart());

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res?.data) {
        dispatch(loginSuccess(res.data));
        const userRole = res.data.user.role;

        if (redirect) {
          navigate(redirect);
        } else if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'provider') {
          navigate('/provider/dashboard');
        } else {
          navigate('/customer/dashboard');
        }
      }
    } catch (err) {
      dispatch(loginFailure(err.message || 'Login failed'));
      setLocalError(err.message || 'Invalid email or password');
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLocalError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-premium">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Sign In to LocalTrust
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Access your bookings, verified credentials, and real-time communications.
          </p>
        </div>

        {/* Demo Accounts Quick-Fill Panel */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <UserCheck className="w-4 h-4 text-brand-600" />
            <span>1-Click Demo Evaluation Credentials</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('customer@localtrust.com', 'Customer@LocalTrust2026')}
              className="p-1.5 rounded-lg bg-white hover:bg-brand-50 border border-slate-200 text-slate-700 font-semibold text-[11px] transition-colors truncate"
            >
              👤 Customer
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('rajesh.electrician@localtrust.com', 'Provider@LocalTrust2026')}
              className="p-1.5 rounded-lg bg-white hover:bg-teal-50 border border-slate-200 text-teal-700 font-semibold text-[11px] transition-colors truncate"
            >
              🛠️ Provider
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@localtrust.com', 'Admin@LocalTrust2026')}
              className="p-1.5 rounded-lg bg-white hover:bg-purple-50 border border-slate-200 text-purple-700 font-semibold text-[11px] transition-colors truncate"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {(localError || error) && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {localError || error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl py-2.5 mt-2" isLoading={loading}>
            Sign In to Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
