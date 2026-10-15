// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const expired = params.get('expired');

  function validate() {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 🌿`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center p-6 selection:bg-secondary-container selection:text-primary">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-2xl">recycling</span>
        </div>
        <div>
          <span className="text-headline-sm font-headline-sm text-primary tracking-tight">EcoTrack</span>
          <span className="block text-label-sm font-label-sm text-secondary font-semibold uppercase tracking-wider">Precision Cleantech Logistics</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-headline-md font-headline-md text-on-surface">Welcome Back</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">Sign in to your municipal waste management portal</p>
        </div>

        {expired && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">warning</span>
            <span>Your session expired. Please sign in again.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="text-label-md font-label-md text-on-surface block mb-1" htmlFor="login-email">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className="w-full rounded-lg border border-outline-variant text-body-md font-body-md p-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary/30 bg-surface-container-lowest"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              autoComplete="email"
            />
            {errors.email && <div className="text-label-sm text-error mt-1">{errors.email}</div>}
          </div>

          <div>
            <label className="text-label-md font-label-md text-on-surface block mb-1" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="w-full rounded-lg border border-outline-variant text-body-md font-body-md p-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary/30 bg-surface-container-lowest"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
            />
            {errors.password && <div className="text-label-sm text-error mt-1">{errors.password}</div>}
          </div>

          <button
            id="btn-login"
            type="submit"
            disabled={loading}
            className="w-full bg-primary-container text-on-primary py-2.5 px-4 rounded-xl font-title-md text-body-md hover:bg-secondary active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="mt-6 pt-5 border-t border-outline-variant/60">
          <span className="text-label-sm font-label-sm text-outline block text-center mb-3">Quick Demo Access</span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setForm({ email: 'rahul@demo.dev', password: 'password' })}
              className="py-2 px-3 rounded-lg border border-outline-variant bg-surface-container text-body-sm font-medium hover:bg-surface-container-high transition-colors text-center cursor-pointer"
            >
              👤 Resident User
            </button>
            <button
              type="button"
              onClick={() => setForm({ email: 'admin@ecotrack.dev', password: 'password' })}
              className="py-2 px-3 rounded-lg border border-outline-variant bg-surface-container text-body-sm font-medium hover:bg-surface-container-high transition-colors text-center cursor-pointer"
            >
              ⚡ Operations Admin
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-body-sm text-on-surface-variant">
          Don't have an account?{' '}
          <Link to="/register" className="text-secondary font-title-md hover:underline">
            Register new account →
          </Link>
        </div>
      </div>
    </div>
  );
}
