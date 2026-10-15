// frontend/src/layouts/AppLayout.jsx
// Preserved exact Stitch App Canvas Layout with Top Header
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function AppLayout({ children }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex">
      {/* Sidebar fixed at 64 width */}
      <Sidebar />

      {/* Main Canvas with 64 left padding */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        {/* Top Header Bar from Stitch design */}
        <header className="h-16 border-b border-outline-variant bg-surface-container-lowest sticky top-0 z-30 px-8 flex items-center justify-between shadow-xs">
          {/* Search Input & Environment Pill */}
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-72">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">search</span>
              <input
                type="text"
                placeholder="Search manifests, receipts, waste..."
                className="w-full h-10 pl-9 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 transition-all"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant text-on-surface-variant text-label-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>{isAdmin ? 'FLEET SYNC: LIVE (0.24s)' : 'Simulation Environment • v1.4'}</span>
            </div>
          </div>

          {/* Actions Cluster */}
          <div className="flex items-center gap-4">
            <button
              className="relative p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface-container-lowest"></span>
            </button>

            <div className="h-6 w-px bg-outline-variant"></div>

            <button
              onClick={() => navigate(isAdmin ? '/admin/pickups' : '/schedule')}
              className="inline-flex items-center gap-2 bg-primary text-surface-container-lowest hover:bg-primary-container px-4 py-2 rounded-lg text-body-md font-semibold transition-all duration-150 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">{isAdmin ? 'tune' : 'add_circle'}</span>
              <span>{isAdmin ? 'Manage Queue' : 'New Pickup Request'}</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Footer from Stitch */}
        <footer className="mt-auto border-t border-outline-variant bg-surface-container-lowest">
          <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-5 max-w-7xl mx-auto gap-4 text-body-sm text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary">EcoTrack</span>
              <span>© 2026 EcoTrack Technologies Inc. Precision Cleantech Logistics.</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="hover:text-primary cursor-pointer">Compliance & Audits</span>
              <span className="hover:text-primary cursor-pointer">API Telemetry</span>
              <span className="text-secondary font-medium">ISO 14001 Audited</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
