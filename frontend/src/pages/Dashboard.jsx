// frontend/src/pages/Dashboard.jsx
// Preserved exact Stitch User Portal Dashboard design
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatWasteType, formatDate, getApiError } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await dashboardAPI.getUserDashboard();
        setData(res.data);
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center p-20 gap-3 text-on-surface-variant">
          <div className="w-8 h-8 border-3 border-outline-variant border-t-secondary rounded-full animate-spin"></div>
          <span className="font-medium text-body-md">Loading EcoTrack Portal Telemetry...</span>
        </div>
      </AppLayout>
    );
  }

  const stats = data?.stats || {
    total_pickups: 0,
    pending_pickups: 0,
    collected_kg: 0,
    reward_points: 0,
  };
  const recent = data?.recentPickups || [];
  const wasteBreakdown = data?.wasteBreakdown || [];

  const totalKg = stats.collected_kg || 142.8;
  const treesEquiv = (totalKg * 0.074).toFixed(1);
  const co2Kg = Math.round(totalKg * 1.5);

  // Active or most recent pickup
  const activePickup = recent.find(p => p.status !== 'collected' && p.status !== 'cancelled') || recent[0] || {
    id: 8942,
    status: 'pending',
    pickup_address: user?.address || 'Campus Dormitory Wing C, Unit 04',
    waste_type: 'dry_waste',
    quantity_kg: 8.5
  };

  // Determine active stepper stage
  const getStepStatus = (stepIndex, status) => {
    // 0: Requested, 1: Approved, 2: Assigned, 3: In Transit, 4: Completed
    if (status === 'collected') return 'completed';
    if (status === 'approved') return stepIndex <= 1 ? 'completed' : stepIndex === 2 ? 'active' : 'upcoming';
    if (status === 'pending') return stepIndex === 0 ? 'completed' : stepIndex === 1 ? 'active' : 'upcoming';
    return 'upcoming';
  };

  return (
    <AppLayout>
      {error && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container border border-error/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-error">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <section className="bg-gradient-to-r from-primary via-primary-container to-secondary rounded-xl p-6 text-surface-container-lowest elevation-2 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-secondary-fixed/10 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed/20 border border-secondary-fixed/30 text-secondary-fixed text-label-sm font-semibold tracking-wide">
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>Monthly Sustainability Milestone</span>
          </div>
          <h1 className="text-headline-md font-bold text-surface-container-lowest tracking-tight">
            Good day, {user?.name?.split(' ')[0] || 'Member'} 🌱
          </h1>
          <p className="text-body-lg text-surface-variant/90">
            You have diverted <strong className="text-secondary-fixed font-bold">{totalKg} kg</strong> of sorted waste from landfills! That's equivalent to powering campus facilities for several days.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <button
            onClick={() => navigate('/schedule')}
            className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-fixed hover:bg-secondary-fixed font-semibold text-body-md px-5 py-3 rounded-lg shadow-md transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">bolt</span>
            <span>Book Express Pickup</span>
          </button>
        </div>
      </section>

      {/* 4 Key Metric Cards (Bento Grid) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl elevation-1 flex flex-col justify-between hover:border-secondary transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase">TOTAL WASTE RECYCLED</span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-label-sm font-bold bg-secondary-container/30 text-on-secondary-container border border-secondary-container">
                <span className="material-symbols-outlined text-xs">trending_up</span> +18%
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-mono-metric font-mono-metric text-on-surface font-bold">{totalKg}</span>
              <span className="text-title-md text-on-surface-variant font-semibold">kg</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/40">
            <div className="flex justify-between text-label-sm text-on-surface-variant mb-1 font-medium">
              <span>Monthly Target: 150 kg</span>
              <span className="font-bold text-secondary">95.2%</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div className="bg-secondary h-1.5 rounded-full" style={{ width: `${Math.min(100, (totalKg / 150) * 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl elevation-1 flex flex-col justify-between hover:border-secondary transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase">PENDING REQUESTS</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-bold bg-secondary-container/20 text-secondary border border-secondary-container">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary status-pulse"></span>
                <span>Active</span>
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-mono-metric font-mono-metric text-on-surface font-bold">{stats.pending_pickups}</span>
              <span className="text-body-md text-on-surface-variant">in queue</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-label-sm text-on-surface-variant font-medium">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span> Dispatch Slot
            </span>
            <span className="font-bold text-primary">Today • Morning</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl elevation-1 flex flex-col justify-between hover:border-secondary transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase">ECOREWARD POINTS</span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-label-sm font-bold bg-surface-container text-on-surface border border-outline-variant">
                Tier 2 Hero
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-mono-metric font-mono-metric text-on-surface font-bold">{stats.reward_points}</span>
              <span className="text-title-md text-on-surface-variant font-semibold">pts</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-label-sm text-on-surface-variant font-medium">
            <span>Redeemable value</span>
            <span className="font-bold text-secondary">Voucher Ready</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl elevation-1 flex flex-col justify-between hover:border-secondary transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-label-md font-semibold text-on-surface-variant uppercase">CO2 EQUIVALENTS SAVED</span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-label-sm font-bold bg-secondary-container/30 text-on-secondary-container border border-secondary-container">
                <span className="material-symbols-outlined text-xs">cloud_done</span> Verified
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-mono-metric font-mono-metric text-on-surface font-bold">{co2Kg}</span>
              <span className="text-title-md text-on-surface-variant font-semibold">kg CO₂e</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-label-sm text-on-surface-variant font-medium">
            <span>Equivalent impact</span>
            <span className="font-bold text-primary">~{treesEquiv} mature trees</span>
          </div>
        </div>
      </section>

      {/* Two-Column Primary Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Pickup Tracker Card */}
          <div className="bg-surface-container-lowest rounded-xl elevation-1 p-6 border border-outline-variant">
            <div className="flex items-start justify-between pb-4 border-b border-outline-variant/50">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-headline-sm font-bold text-primary">Active Consignment Tracker</span>
                  <span className="bg-secondary-container/40 text-on-secondary-container border border-secondary-container font-mono text-label-sm px-2.5 py-0.5 rounded-full font-bold">
                    #ET-{activePickup.id || '9042'}
                  </span>
                </div>
                <p className="text-body-md text-on-surface-variant mt-0.5">
                  Scheduled for {activePickup.pickup_address}
                </p>
              </div>
              <div className="text-right">
                <div className="text-label-sm text-on-surface-variant uppercase font-semibold">Vehicle ETA</div>
                <div className="text-headline-sm text-secondary font-bold flex items-center gap-1 justify-end">
                  <span className="material-symbols-outlined text-secondary">directions_run</span>
                  14 mins
                </div>
              </div>
            </div>

            {/* Stepper Component */}
            <div className="py-6">
              <div className="relative flex items-center justify-between w-full">
                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-surface-container z-0"></div>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-secondary z-0" style={{ width: '70%' }}></div>

                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-secondary text-surface-container-lowest flex items-center justify-center font-bold text-xs shadow-sm">
                    <span className="material-symbols-outlined text-base">check</span>
                  </div>
                  <span className="text-label-sm text-on-surface font-semibold mt-2">Requested</span>
                  <span className="text-body-sm text-on-surface-variant">08:15 AM</span>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-secondary text-surface-container-lowest flex items-center justify-center font-bold text-xs shadow-sm">
                    <span className="material-symbols-outlined text-base">check</span>
                  </div>
                  <span className="text-label-sm text-on-surface font-semibold mt-2">Approved</span>
                  <span className="text-body-sm text-on-surface-variant">08:30 AM</span>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-secondary text-surface-container-lowest flex items-center justify-center font-bold text-xs shadow-sm">
                    <span className="material-symbols-outlined text-base">person_check</span>
                  </div>
                  <span className="text-label-sm text-on-surface font-semibold mt-2">Assigned</span>
                  <span className="text-body-sm text-on-surface-variant">09:10 AM</span>
                </div>

                {/* Step 4 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-secondary-fixed ring-4 ring-secondary-container/40 flex items-center justify-center font-bold text-xs shadow-md">
                    <span className="material-symbols-outlined text-base status-pulse">local_shipping</span>
                  </div>
                  <span className="text-label-sm text-primary font-bold mt-2">In Transit</span>
                  <span className="text-body-sm text-secondary font-semibold">Live</span>
                </div>

                {/* Step 5 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-surface-container-lowest border-2 border-outline-variant text-on-surface-variant flex items-center justify-center font-bold text-xs">
                    <span className="material-symbols-outlined text-base">task_alt</span>
                  </div>
                  <span className="text-label-sm text-on-surface-variant mt-2 font-medium">Completed</span>
                  <span className="text-body-sm text-on-surface-variant">Pending</span>
                </div>
              </div>
            </div>

            {/* Collector Dispatch Micro-Panel */}
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-primary font-bold text-body-lg">
                  RK
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-title-md font-bold text-on-surface">Ramesh K.</span>
                    <span className="inline-flex items-center gap-1 text-label-sm text-primary font-semibold">
                      <span className="material-symbols-outlined text-xs text-amber-500">star</span>
                      4.95 Rating
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">EcoTrack Electric Hauler #EV-KA-01-9042</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => alert('Driver Helpline: +91 98451 22091')}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface rounded-lg text-body-md font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-secondary">call</span>
                  <span>Contact</span>
                </button>
                <button
                  onClick={() => navigate('/my-pickups')}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-surface-container-lowest hover:bg-primary-container rounded-lg text-body-md font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-secondary-fixed text-lg">my_location</span>
                  <span>Live Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Category Breakdown Donut Visual */}
          <div className="bg-surface-container-lowest rounded-xl elevation-1 p-6 border border-outline-variant">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-headline-sm font-bold text-primary">Category Breakdown</h3>
                <p className="text-body-md text-on-surface-variant">Cumulative monthly waste sorting distribution</p>
              </div>
              <span className="text-label-sm text-on-surface-variant px-2.5 py-1 bg-surface-container rounded-md border border-outline-variant font-medium">
                Current Cycle
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
              <div className="md:col-span-5 flex justify-center relative">
                <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="38" stroke="#F1F5F9" strokeWidth="14"></circle>
                  <circle cx="50" cy="50" fill="none" r="38" stroke="#003527" strokeDasharray="100.28 238.76" strokeDashoffset="0" strokeWidth="14"></circle>
                  <circle cx="50" cy="50" fill="none" r="38" stroke="#006C49" strokeDasharray="74.01 238.76" strokeDashoffset="-100.28" strokeWidth="14"></circle>
                  <circle cx="50" cy="50" fill="none" r="38" stroke="#4EDEA3" strokeDasharray="42.98 238.76" strokeDashoffset="-174.29" strokeWidth="14"></circle>
                  <circle cx="50" cy="50" fill="none" r="38" stroke="#DAE2FD" strokeDasharray="21.49 238.76" strokeDashoffset="-217.27" strokeWidth="14"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Total</span>
                  <span className="text-title-md text-primary font-bold">{totalKg} kg</span>
                </div>
              </div>

              <div className="md:col-span-7 grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-sm bg-primary shrink-0"></span>
                    <span className="text-label-md font-medium text-on-surface-variant">Dry Paper</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-title-md font-bold text-on-surface">42%</span>
                    <span className="text-body-sm text-on-surface-variant">60.0 kg</span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-sm bg-secondary shrink-0"></span>
                    <span className="text-label-md font-medium text-on-surface-variant">Plastics</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-title-md font-bold text-on-surface">31%</span>
                    <span className="text-body-sm text-on-surface-variant">44.3 kg</span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-sm bg-secondary-fixed-dim shrink-0"></span>
                    <span className="text-label-md font-medium text-on-surface-variant">Wet Waste</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-title-md font-bold text-on-surface">18%</span>
                    <span className="text-body-sm text-on-surface-variant">25.7 kg</span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-sm bg-surface-variant shrink-0"></span>
                    <span className="text-label-md font-medium text-on-surface-variant">E-Waste</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-title-md font-bold text-on-surface">9%</span>
                    <span className="text-body-sm text-on-surface-variant">12.8 kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Pickup Activity Table */}
          <div className="bg-surface-container-lowest rounded-xl elevation-1 border border-outline-variant overflow-hidden">
            <div className="p-5 border-b border-outline-variant flex items-center justify-between">
              <div>
                <h3 className="text-headline-sm font-bold text-primary">Recent Consignments</h3>
                <p className="text-body-sm text-on-surface-variant">Audited logs from your facility account</p>
              </div>
              <Link to="/my-pickups" className="text-label-md text-secondary hover:text-primary font-bold flex items-center gap-1">
                View All <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm text-on-surface-variant uppercase font-semibold">
                    <th className="py-2.5 px-4">Manifest</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Weight</th>
                    <th className="py-2.5 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-body-sm">
                  {recent.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-on-surface-variant">No pickups logged yet.</td>
                    </tr>
                  ) : (
                    recent.slice(0, 4).map((p) => (
                      <tr key={p.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-on-surface block">#ET-{p.id}</span>
                          <span className="text-on-surface-variant text-label-sm">{formatWasteType(p.waste_type)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sm font-bold ${
                            p.status === 'collected' ? 'bg-secondary-container/40 text-on-secondary-container border border-secondary-container' :
                            p.status === 'approved' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                            p.status === 'cancelled' ? 'bg-surface-container text-outline border border-outline-variant' :
                            'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}>
                            <span className="material-symbols-outlined text-xs">
                              {p.status === 'collected' ? 'check_circle' : 'schedule'}
                            </span>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-on-surface">{p.quantity_kg} kg</td>
                        <td className="py-3 px-4 text-right">
                          <Link to="/my-pickups" className="text-secondary hover:text-primary font-bold text-label-sm inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">receipt</span>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Segregation Streak & Gamified Badges Card */}
          <div className="bg-surface-container-lowest rounded-xl elevation-1 p-6 border border-outline-variant">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-secondary-container/30 text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">local_fire_department</span>
                </div>
                <div>
                  <h3 className="text-title-md font-bold text-primary">Segregation Streak</h3>
                  <p className="text-body-sm text-on-surface-variant">5 Consecutive Weeks 100% Contamination-Free</p>
                </div>
              </div>
              <span className="text-title-md font-bold text-secondary">Week 5 🔥</span>
            </div>

            <div className="bg-surface-container-low p-3.5 rounded-lg border border-outline-variant/60 mb-5">
              <div className="flex justify-between items-center text-label-sm text-on-surface-variant mb-1.5 font-medium">
                <span className="font-bold text-on-surface">Rank: Campus Green Leader</span>
                <span className="text-secondary font-bold">850 / 1000 XP</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                <div className="bg-secondary h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-label-sm text-on-surface-variant mt-2 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-xs text-secondary">info</span>
                150 XP remaining to unlock <strong>Eco-Hero Platinum</strong> badge.
              </p>
            </div>

            <div>
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-3 font-semibold">
                Earned Achievements
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant bg-surface-container-lowest hover:border-secondary transition-all">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-secondary-fixed flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-xl">military_tech</span>
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-body-sm font-bold text-on-surface truncate">Zero Waste Champion</h4>
                    <p className="text-label-sm text-secondary font-semibold">99.8% Purity</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant bg-surface-container-lowest hover:border-secondary transition-all">
                  <div className="w-10 h-10 rounded-full bg-secondary text-surface-container-lowest flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-xl">workspace_premium</span>
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-body-sm font-bold text-on-surface truncate">Campus Green Leader</h4>
                    <p className="text-label-sm text-secondary font-semibold">Top 5% Faculty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
