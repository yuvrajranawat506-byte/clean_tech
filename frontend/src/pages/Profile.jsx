// frontend/src/pages/Profile.jsx
import React, { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUserInContext } = useAuth();
  const [tab, setTab] = useState('profile'); // 'profile' | 'password'

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '', phone: user?.phone || '', address: user?.address || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  function validateProfile() {
    const e = {};
    if (!profileForm.name.trim()) e.name = 'Name is required';
    if (profileForm.phone && !/^[6-9]\d{9}$/.test(profileForm.phone)) e.phone = 'Invalid Indian phone number';
    setProfileErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    if (!validateProfile()) return;
    setProfileLoading(true);
    try {
      const res = await usersAPI.updateProfile(profileForm);
      updateUserInContext(res.data.user);
      toast.success('Citizen profile updated successfully!');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setProfileLoading(false);
    }
  }

  function validatePassword() {
    const e = {};
    if (!passwordForm.current_password) e.current_password = 'Current password is required';
    if (!passwordForm.new_password || passwordForm.new_password.length < 6) e.new_password = 'New password must be at least 6 characters';
    if (passwordForm.new_password !== passwordForm.confirm_password) e.confirm_password = 'Passwords do not match';
    setPasswordErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    if (!validatePassword()) return;
    setPasswordLoading(true);
    try {
      await usersAPI.changePassword({ current_password: passwordForm.current_password, new_password: passwordForm.new_password });
      toast.success('Security password changed successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setPasswordLoading(false);
    }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'US';

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">person</span>
              <h1 className="text-headline-md font-headline-md text-primary tracking-tight">Citizen Profile &amp; Preferences</h1>
            </div>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              Manage your verified dispatch address, contact coordinates, and portal credentials.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface">
            <span className="material-symbols-outlined text-secondary text-base fill-1">verified_user</span>
            <span className="text-label-sm font-label-sm font-semibold">Account Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left identity card */}
          <div className="md:col-span-4 space-y-4">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 text-center shadow-sm">
              <div className="w-20 h-20 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-sm">
                {initials}
              </div>
              <h2 className="text-title-md font-title-md text-on-surface">{user?.name}</h2>
              <p className="text-body-sm font-body-sm text-outline mt-0.5">{user?.email}</p>
              
              <div className="mt-4 pt-4 border-t border-outline-variant/60 flex items-center justify-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold ${
                  user?.role === 'admin'
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-secondary-container text-on-secondary-container'
                }`}>
                  {user?.role === 'admin' ? '⚡ Operations Admin' : '🌿 Tier 2 EcoHero'}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-2 shadow-sm space-y-1">
              <button
                type="button"
                onClick={() => setTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-body-md font-title-md transition-colors cursor-pointer ${
                  tab === 'profile'
                    ? 'bg-secondary-container/25 text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-lg">badge</span>
                <span>Personal Information</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('password')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-body-md font-title-md transition-colors cursor-pointer ${
                  tab === 'password'
                    ? 'bg-secondary-container/25 text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-lg">lock</span>
                <span>Security &amp; Password</span>
              </button>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="md:col-span-8 bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 shadow-sm">
            {tab === 'profile' ? (
              <form onSubmit={handleProfileSubmit} noValidate className="space-y-5">
                <div className="border-b border-outline-variant pb-3 mb-4">
                  <h3 className="text-title-md font-title-md text-primary">Identity &amp; Address Verification</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">Used by municipal drivers to pinpoint collection points.</p>
                </div>

                <div>
                  <label className="text-label-md font-label-md text-on-surface block mb-1" htmlFor="p-name">
                    Full Legal Name *
                  </label>
                  <input
                    id="p-name"
                    type="text"
                    className="w-full rounded-lg border border-outline-variant text-body-md font-body-md p-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary/30 bg-surface-container-lowest"
                    value={profileForm.name}
                    onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  />
                  {profileErrors.name && <div className="text-label-sm text-error mt-1">{profileErrors.name}</div>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-label-md font-label-md text-on-surface block mb-1">
                      Email Address (Permanent UID)
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-outline-variant/60 bg-surface-container-low text-body-md font-body-md p-2.5 text-outline cursor-not-allowed"
                      value={user?.email || ''}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="text-label-md font-label-md text-on-surface block mb-1" htmlFor="p-phone">
                      Primary Contact Number
                    </label>
                    <input
                      id="p-phone"
                      type="tel"
                      className="w-full rounded-lg border border-outline-variant text-body-md font-body-md p-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary/30 bg-surface-container-lowest"
                      value={profileForm.phone}
                      onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                    />
                    {profileErrors.phone && <div className="text-label-sm text-error mt-1">{profileErrors.phone}</div>}
                  </div>
                </div>

                <div>
                  <label className="text-label-md font-label-md text-on-surface block mb-1" htmlFor="p-address">
                    Registered Geotagged Address
                  </label>
                  <textarea
                    id="p-address"
                    rows="3"
                    className="w-full rounded-lg border border-outline-variant text-body-md font-body-md p-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary/30 bg-surface-container-lowest"
                    value={profileForm.address}
                    onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-primary-container text-on-primary py-2.5 px-6 rounded-xl font-title-md text-body-md hover:bg-secondary active:scale-[0.99] transition-all shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {profileLoading ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} noValidate className="space-y-5">
                <div className="border-b border-outline-variant pb-3 mb-4">
                  <h3 className="text-title-md font-title-md text-primary">Credential Security</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">Update your encrypted credentials to protect your EcoTrack ledger.</p>
                </div>

                <div>
                  <label className="text-label-md font-label-md text-on-surface block mb-1" htmlFor="curr-pwd">
                    Current Password *
                  </label>
                  <input
                    id="curr-pwd"
                    type="password"
                    className="w-full rounded-lg border border-outline-variant text-body-md font-body-md p-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary/30 bg-surface-container-lowest"
                    value={passwordForm.current_password}
                    onChange={e => setPasswordForm(f => ({ ...f, current_password: e.target.value }))}
                  />
                  {passwordErrors.current_password && <div className="text-label-sm text-error mt-1">{passwordErrors.current_password}</div>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-label-md font-label-md text-on-surface block mb-1" htmlFor="new-pwd">
                      New Password *
                    </label>
                    <input
                      id="new-pwd"
                      type="password"
                      className="w-full rounded-lg border border-outline-variant text-body-md font-body-md p-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary/30 bg-surface-container-lowest"
                      placeholder="Min 6 characters"
                      value={passwordForm.new_password}
                      onChange={e => setPasswordForm(f => ({ ...f, new_password: e.target.value }))}
                    />
                    {passwordErrors.new_password && <div className="text-label-sm text-error mt-1">{passwordErrors.new_password}</div>}
                  </div>

                  <div>
                    <label className="text-label-md font-label-md text-on-surface block mb-1" htmlFor="confirm-pwd">
                      Confirm New Password *
                    </label>
                    <input
                      id="confirm-pwd"
                      type="password"
                      className="w-full rounded-lg border border-outline-variant text-body-md font-body-md p-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary/30 bg-surface-container-lowest"
                      placeholder="Repeat new password"
                      value={passwordForm.confirm_password}
                      onChange={e => setPasswordForm(f => ({ ...f, confirm_password: e.target.value }))}
                    />
                    {passwordErrors.confirm_password && <div className="text-label-sm text-error mt-1">{passwordErrors.confirm_password}</div>}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-primary-container text-on-primary py-2.5 px-6 rounded-xl font-title-md text-body-md hover:bg-secondary active:scale-[0.99] transition-all shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
