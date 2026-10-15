// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', address: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Invalid Indian phone number';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      toast.success('Account created! Welcome to EcoTrack 🌿');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

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

      <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-headline-md font-headline-md text-on-surface">Join EcoTrack</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">Start your smart waste segregation journey today</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label-md font-label-md text-on-surface block mb-1" htmlFor="reg-name">
                Full Name *
              </label>
              <input
                id="reg-name"
                type="text"
                className="w-full rounded-lg border border-outline-variant text-body-md font-body-md p-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary/30 bg-surface-container-lowest"
                placeholder="Rahul Sharma"
                value={form.name}
                onChange={update('name')}
              />
              {errors.name && <div className="text-label-sm text-error mt-1">{errors.name}</div>}
            </div>

            <div>
              <label className="text-label-md font-label-md text-on-surface block mb-1" htmlFor="reg-phone">
                Phone Number
              </label>
              <input
                id="reg-phone"
                type="tel"
                className="w-full rounded-lg border border-outline-variant text-body-md font-body-md p-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary/30 bg-surface-container-lowest"
                placeholder="9876543210"
                value={form.phone}
                onChange={update('phone')}
              />
              {errors.phone && <div className="text-label-sm text-error mt-1">{errors.phone}</div>}
            </div>
          </div>

          <div>
            <label className="text-label-md font-label-md text-on-surface block mb-1" htmlFor="reg-email">
              Email Address *
            </label>
            <input
              id="reg-email"
              type="email"
              className="w-full rounded-lg border border-outline-variant text-body-md font-body-md p-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary/30 bg-surface-container-lowest"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              autoComplete="email"
            />
            {errors.email && <div className="text-label-sm text-error mt-1">{errors.email}</div>}
          </div>

          <div>
            <label className="text-label-md font-label-md text-on-surface block mb-1" htmlFor="reg-address">
              Primary Pickup Address
            </label>
            <input
              id="reg-address"
              type="text"
              className="w-full rounded-lg border border-outline-variant text-body-md font-body-md p-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary/30 bg-surface-container-lowest"
              placeholder="Flat 101, Green Glen Layout, Bengaluru"
              value={form.address}
              onChange={update('address')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label-md font-label-md text-on-surface block mb-1" htmlFor="reg-password">
                Password *
              </label>
              <input
                id="reg-password"
                type="password"
                className="w-full rounded-lg border border-outline-variant text-body-md font-body-md p-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary/30 bg-surface-container-lowest"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={update('password')}
              />
              {errors.password && <div className="text-label-sm text-error mt-1">{errors.password}</div>}
            </div>

            <div>
              <label className="text-label-md font-label-md text-on-surface block mb-1" htmlFor="reg-confirm">
                Confirm Password *
              </label>
              <input
                id="reg-confirm"
                type="password"
                className="w-full rounded-lg border border-outline-variant text-body-md font-body-md p-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary/30 bg-surface-container-lowest"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
              />
              {errors.confirmPassword && <div className="text-label-sm text-error mt-1">{errors.confirmPassword}</div>}
            </div>
          </div>

          <button
            id="btn-register"
            type="submit"
            disabled={loading}
            className="w-full bg-primary-container text-on-primary py-2.5 px-4 rounded-xl font-title-md text-body-md hover:bg-secondary active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Citizen Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-body-sm text-on-surface-variant">
          Already registered?{' '}
          <Link to="/login" className="text-secondary font-title-md hover:underline">
            Sign in to Portal →
          </Link>
        </div>
      </div>
    </div>
  );
}
