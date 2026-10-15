// frontend/src/components/Sidebar.jsx
// Preserved exact Stitch design for SideNavBar component
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function StitchNavItem({ to, icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ease-in-out ${
          isActive
            ? 'bg-secondary-container/20 text-primary font-semibold shadow-xs'
            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary font-medium text-body-md'
        }`
      }
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
      <span className="text-body-md">{label}</span>
      {badge && (
        <span className="ml-auto bg-secondary-fixed-dim/30 text-primary text-label-sm px-2 py-0.5 rounded-full font-bold">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    toast.success('Signed out successfully');
    navigate('/login');
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ET';

  return (
    <aside className="flex flex-col justify-between h-screen w-64 p-4 fixed left-0 top-0 z-40 bg-surface-container-lowest border-r border-outline-variant shadow-sm">
      {/* Header Brand Section */}
      <div>
        <div className="flex items-center gap-3 px-2 py-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-secondary-fixed shadow-sm">
            <span className="material-symbols-outlined text-secondary-fixed text-2xl">
              {isAdmin ? 'admin_panel_settings' : 'eco'}
            </span>
          </div>
          <div>
            <span className="text-title-md font-bold text-primary tracking-tight block">
              {isAdmin ? 'EcoTrack Operations' : 'EcoTrack Portal'}
            </span>
            <span className="text-label-sm text-on-surface-variant block tracking-wider uppercase font-semibold">
              {isAdmin ? 'Admin Control Center' : 'User Dashboard'}
            </span>
          </div>
        </div>

        {/* Quick Action CTA */}
        {!isAdmin ? (
          <div className="px-1 mb-5">
            <button
              onClick={() => navigate('/schedule')}
              className="w-full flex items-center justify-center gap-2 bg-primary-container hover:bg-primary text-surface-container-lowest font-semibold text-body-md py-2.5 px-4 rounded-lg transition-colors duration-150 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">calendar_add_on</span>
              <span>Schedule Pickup</span>
            </button>
          </div>
        ) : (
          <div className="px-2 py-1.5 mb-4 bg-surface-container-low rounded-lg flex items-center justify-between border border-outline-variant/40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-label-sm text-on-surface-variant font-medium">Ops Node: BLR-01</span>
            </div>
            <span className="text-label-sm text-primary font-bold">Online</span>
          </div>
        )}

        {/* Main Navigation Tabs */}
        <nav className="space-y-1">
          {isAdmin ? (
            <>
              <div className="text-label-sm uppercase tracking-wider text-outline px-3 pt-2 pb-1 font-semibold">Ops Control</div>
              <StitchNavItem to="/admin/dashboard" icon="analytics" label="Admin Overview" />
              <StitchNavItem to="/admin/pickups" icon="pending_actions" label="Pickup Queue" />
              <StitchNavItem to="/admin/users" icon="group" label="User Directory" />
              <StitchNavItem to="/impact" icon="insights" label="Impact Analytics" />
            </>
          ) : (
            <>
              <div className="text-label-sm uppercase tracking-wider text-outline px-3 pt-2 pb-1 font-semibold">Main Menu</div>
              <StitchNavItem to="/dashboard" icon="dashboard" label="Overview" />
              <StitchNavItem to="/schedule" icon="calendar_add_on" label="Schedule Pickup" />
              <StitchNavItem to="/my-pickups" icon="local_shipping" label="My Pickups" />
              <StitchNavItem to="/rewards" icon="military_tech" label="Rewards & Badges" />
              <StitchNavItem to="/impact" icon="eco" label="Environmental Impact" />
            </>
          )}
        </nav>
      </div>

      {/* Footer Tabs & User Context */}
      <div className="border-t border-outline-variant pt-3 space-y-2">
        <StitchNavItem to="/profile" icon="person" label="Profile" />

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-error font-medium text-body-md rounded-lg hover:bg-error-container/20 transition-all duration-150"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span>Sign Out</span>
        </button>

        {/* User Profile Badge */}
        <div className="mt-2 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-container text-surface-container-lowest flex items-center justify-center font-bold text-body-sm shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-body-sm font-bold text-on-surface truncate">{user?.name || 'Authorized Member'}</p>
            <p className="text-label-sm text-on-surface-variant truncate">
              {isAdmin ? 'System Administrator' : (user?.address || 'Koramangala Green Campus')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
