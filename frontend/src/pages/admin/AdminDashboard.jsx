// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { dashboardAPI, adminAPI } from '../../services/api';
import { formatWasteType, formatDate, getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [dashRes, pickupsRes] = await Promise.all([
        dashboardAPI.getAdminDashboard(),
        adminAPI.getAllPickups({ limit: 20 }),
      ]);
      setDashboardData(dashRes.data);
      setPickups(pickupsRes.data.pickups || []);
    } catch (err) {
      setError(getApiError(err) || 'Failed to load operations telemetry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleQuickAction(id, currentStatus, newStatus) {
    setUpdatingId(id);
    try {
      await adminAPI.updatePickupStatus(id, newStatus);
      toast.success(`Request #ET-${id} marked as ${newStatus}!`);
      loadData();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setUpdatingId(null);
    }
  }

  function exportCSV() {
    if (!pickups.length) {
      toast.error('No records to export');
      return;
    }
    const headers = ['Request ID', 'User Name', 'User Email', 'Waste Type', 'Quantity (kg)', 'Date', 'Time', 'Address', 'Status'];
    const rows = pickups.map(p => [
      `#ET-${p.id}`,
      `"${p.user_name || ''}"`,
      `"${p.user_email || ''}"`,
      p.waste_type,
      p.quantity_kg,
      p.pickup_date,
      p.pickup_time || '',
      `"${(p.pickup_address || '').replace(/"/g, '""')}"`,
      p.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecotrack_dispatch_manifest_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Logistics Manifest exported as CSV! 📥');
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-body-md font-body-md text-on-surface-variant">Connecting to Operations Telemetry Hub...</span>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-8 max-w-4xl mx-auto">
          <div className="p-4 rounded-xl bg-error-container text-on-error-container border border-error/30">
            {error}
          </div>
        </div>
      </AppLayout>
    );
  }

  const { stats = {}, wasteByCategory = [] } = dashboardData || {};

  // Filtered pickups
  const filteredPickups = pickups.filter(p => {
    const matchesSearch = !search || 
      `#ET-${p.id}`.toLowerCase().includes(search.toLowerCase()) ||
      (p.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.pickup_address || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate waste category percentages
  const totalCollectedKg = parseFloat(stats.total_collected_kg || 0);

  return (
    <AppLayout>
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Top Operational Status Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">terminal</span>
              <h1 className="text-headline-md font-headline-md text-primary tracking-tight">EcoTrack Operations Pilot</h1>
              <span className="px-2.5 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-on-surface-variant font-medium border border-outline-variant/50">
                Demonstration &amp; Testing Console
              </span>
            </div>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              Metropolitan dispatch triage, automated route telemetry, and certified material stream audits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-body-sm text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-mono text-label-sm font-semibold">FLEET SYNC: LIVE (0.24s)</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface">
              <span className="material-symbols-outlined text-sm text-secondary">notifications</span>
              <span className="text-label-sm font-label-sm font-semibold">{stats.pending_pickups || 0} In Triage Queue</span>
            </div>
          </div>
        </div>

        {/* ==================== TOP OPERATIONS KPI BAR ==================== */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* KPI 1: Registered Users */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Total System Users</span>
              <span className="inline-flex items-center gap-0.5 text-label-sm font-label-sm font-semibold text-secondary bg-surface-container px-2 py-0.5 rounded border border-outline-variant/60">
                <span className="material-symbols-outlined text-xs">arrow_upward</span>
                +12.4%
              </span>
            </div>
            <div className="mt-3">
              <div className="text-mono-metric font-mono-metric text-on-surface">{stats.total_users || 0}</div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Verified residential &amp; commercial accounts</p>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
              <span>Platform Role</span>
              <span className="font-semibold text-primary">100% compliant</span>
            </div>
          </div>

          {/* KPI 2: Active Pickup Queue */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-error"></div>
            <div className="flex items-center justify-between">
              <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Active Pickup Queue</span>
              <span className="inline-flex items-center gap-1 text-label-sm font-label-sm font-semibold text-error bg-error-container px-2 py-0.5 rounded border border-error/20">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                {stats.pending_pickups || 0} Pending Triage
              </span>
            </div>
            <div className="mt-3">
              <div className="text-mono-metric font-mono-metric text-on-surface">
                {stats.pending_pickups || 0} <span className="text-headline-sm font-headline-sm text-on-surface-variant font-normal">reqs</span>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Avg triage latency: 14 mins</p>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
              <span>Approved &amp; Scheduled</span>
              <span className="font-semibold text-primary">{stats.approved_pickups || 0} en route</span>
            </div>
          </div>

          {/* KPI 3: Fleet Trucks on Route */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Fleet Trucks on Route</span>
              <span className="inline-flex items-center gap-1 text-label-sm font-label-sm font-semibold text-primary bg-secondary-container/20 px-2 py-0.5 rounded border border-secondary-container">
                77.8% Deployed
              </span>
            </div>
            <div className="mt-3">
              <div className="text-mono-metric font-mono-metric text-on-surface">
                14 <span className="text-headline-sm font-headline-sm text-on-surface-variant font-normal">/ 18 active</span>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">4 units idle / depot standby</p>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
              <span>Telematics Health</span>
              <span className="font-semibold text-secondary">Optimal (18/18 ping)</span>
            </div>
          </div>

          {/* KPI 4: Waste Diverted Today */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Total Waste Collected</span>
              <span className="inline-flex items-center gap-0.5 text-label-sm font-label-sm font-semibold text-secondary bg-surface-container px-2 py-0.5 rounded border border-outline-variant/60">
                <span className="material-symbols-outlined text-xs">eco</span>
                Goal: 4,000 kg
              </span>
            </div>
            <div className="mt-3">
              <div className="text-mono-metric font-mono-metric text-primary">
                {totalCollectedKg.toFixed(1)} <span className="text-headline-sm font-headline-sm text-on-surface-variant font-normal">kg</span>
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Verified scale weight tally</p>
            </div>
            {/* Progress towards daily goal */}
            <div className="mt-4 pt-3 border-t border-outline-variant/40">
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((totalCollectedKg / 4000) * 100))}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-label-sm font-label-sm text-on-surface-variant mt-1.5">
                <span>{Math.min(100, Math.round((totalCollectedKg / 4000) * 100))}% target achieved</span>
                <span className="font-semibold text-primary">{Math.max(0, 4000 - totalCollectedKg).toFixed(0)} kg to goal</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== CONTROL TOOLBAR & FILTER MATRIX ==================== */}
        <section className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Real-Time Search Bar */}
            <div className="relative flex-1 max-w-lg">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-outline">
                <span className="material-symbols-outlined text-lg">search</span>
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 placeholder:text-outline-variant"
                placeholder="Search by Request ID (#ET-...), Generator Name, Address..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Action Cluster */}
            <div className="flex items-center gap-3">
              <Link
                to="/admin/pickups"
                className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest text-on-surface border border-outline rounded-lg hover:bg-surface-container transition-colors text-body-md font-title-md"
              >
                <span className="material-symbols-outlined text-base text-outline">tune</span>
                <span>Full Queue Manager</span>
              </Link>
              <button
                type="button"
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary rounded-lg hover:bg-secondary transition-all duration-150 shadow-sm text-body-md font-title-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">download</span>
                <span>Export CSV Logistics Manifest</span>
              </button>
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-outline-variant/40">
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mr-2 shrink-0">Status:</span>
            {[
              { id: 'all', label: `All (${pickups.length})` },
              { id: 'pending', label: `Pending (${pickups.filter(p => p.status === 'pending').length})`, color: 'bg-amber-500' },
              { id: 'approved', label: `Approved (${pickups.filter(p => p.status === 'approved').length})`, color: 'bg-blue-500' },
              { id: 'collected', label: `Collected (${pickups.filter(p => p.status === 'collected').length})`, color: 'bg-secondary' },
              { id: 'rejected', label: `Rejected (${pickups.filter(p => p.status === 'rejected').length})`, color: 'bg-error' },
            ].map(tab => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1 rounded-full text-label-md font-label-md transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'bg-surface-container text-on-surface border border-outline-variant hover:border-outline'
                  }`}
                >
                  {tab.color && <span className={`w-2 h-2 rounded-full ${tab.color}`}></span>}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ==================== LIVE PICKUP MANAGEMENT DATA TABLE ==================== */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low/50">
            <div>
              <h2 className="text-title-md font-title-md text-primary">Live Dispatch &amp; Intake Stream</h2>
              <p className="text-body-sm font-body-sm text-on-surface-variant">Real-time telemetry showing generator queues and collector assignments</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-label-sm font-label-sm text-outline">Viewing {filteredPickups.length} of {pickups.length} Records</span>
              <button
                type="button"
                onClick={loadData}
                className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                title="Refresh feed"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant border-b border-outline-variant text-label-sm font-label-sm uppercase tracking-wider">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Generator &amp; Entity</th>
                  <th className="py-3 px-4">Waste Stream &amp; Wt</th>
                  <th className="py-3 px-4">Scheduled Slot &amp; Address</th>
                  <th className="py-3 px-4">Assigned Fleet / Driver</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-body-md font-body-md">
                {filteredPickups.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-outline">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-outline-variant">inbox</span>
                        <span>No pickup requests match the current filters.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPickups.slice(0, 8).map(pickup => {
                    const isPending = pickup.status === 'pending';
                    const isApproved = pickup.status === 'approved';
                    const isCollected = pickup.status === 'collected';
                    const isRejected = pickup.status === 'rejected';

                    return (
                      <tr key={pickup.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-primary">
                          #ET-{pickup.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-title-md text-on-surface text-body-md">{pickup.user_name || 'Rahul Kumar'}</div>
                          <div className="text-label-sm font-label-sm text-on-surface-variant">{pickup.user_email || 'Residential Citizen'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-block w-2.5 h-2.5 rounded-sm ${
                              pickup.waste_type === 'plastic' ? 'bg-emerald-600' :
                              pickup.waste_type === 'dry_waste' ? 'bg-blue-600' :
                              pickup.waste_type === 'e_waste' ? 'bg-purple-600' : 'bg-secondary'
                            }`}></span>
                            <span className="font-semibold text-on-surface">{formatWasteType(pickup.waste_type)}</span>
                          </div>
                          <div className="text-label-sm font-label-sm text-on-surface-variant font-mono font-medium">
                            Est. {pickup.quantity_kg} kg
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-on-surface font-medium">{formatDate(pickup.pickup_date)} • {pickup.pickup_time || '09:00'}</div>
                          <div className="text-label-sm font-label-sm text-outline truncate max-w-[200px]" title={pickup.pickup_address}>
                            {pickup.pickup_address}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {isCollected || isApproved ? (
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-outline text-base">local_shipping</span>
                              <div>
                                <div className="font-medium text-on-surface">E-Van #02 - Driver Amit</div>
                                <div className="text-label-sm font-label-sm text-secondary">
                                  {isCollected ? 'Completed' : 'En route (ETA 14m)'}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-on-surface-variant border border-outline-variant">
                              <span className="material-symbols-outlined text-xs">pending</span>
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Pending Approval
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                              Driver En Route
                            </span>
                          )}
                          {isCollected && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Collected &amp; Weighed
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm font-semibold bg-red-50 text-red-900 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  disabled={updatingId === pickup.id}
                                  onClick={() => handleQuickAction(pickup.id, pickup.status, 'approved')}
                                  className="px-2.5 py-1 text-label-sm font-label-sm bg-primary text-on-primary rounded hover:bg-primary-container font-semibold cursor-pointer disabled:opacity-50"
                                >
                                  Quick Approve
                                </button>
                                <button
                                  type="button"
                                  disabled={updatingId === pickup.id}
                                  onClick={() => handleQuickAction(pickup.id, pickup.status, 'rejected')}
                                  className="px-2.5 py-1 text-label-sm font-label-sm bg-error-container text-on-error-container rounded hover:bg-error-container/80 font-medium cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {isApproved && (
                              <button
                                type="button"
                                disabled={updatingId === pickup.id}
                                onClick={() => handleQuickAction(pickup.id, pickup.status, 'collected')}
                                className="px-2.5 py-1 text-label-sm font-label-sm bg-primary-container text-on-primary rounded hover:bg-secondary font-semibold cursor-pointer disabled:opacity-50"
                              >
                                Mark Collected
                              </button>
                            )}
                            {isCollected && (
                              <span className="text-label-sm font-label-sm font-mono text-outline font-medium px-2 py-1">
                                Audited ({pickup.quantity_kg} kg Net)
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3 border-t border-outline-variant bg-surface-container-low/30 flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
            <div>Showing records 1 to {Math.min(8, filteredPickups.length)} of {filteredPickups.length} active requests</div>
            <Link to="/admin/pickups" className="text-secondary font-title-md hover:underline flex items-center gap-1">
              <span>View Full Interactive Queue</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>
        </section>

        {/* ==================== SECONDARY ANALYTICS & LOGISTICS GRID ==================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Stream Breakdown Analytics (7 cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-title-md font-title-md text-primary">Waste Inflow by Stream</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">Mass diversion tally (kg) recorded across metropolitan hubs</p>
                </div>
                <span className="text-label-sm font-label-sm font-mono text-outline px-2.5 py-1 rounded bg-surface-container border border-outline-variant">
                  TOTAL: {totalCollectedKg.toFixed(1)} KG
                </span>
              </div>

              {/* CSS-based precision bar distribution */}
              <div className="mt-6 space-y-4">
                {wasteByCategory.map(cat => {
                  const kg = parseFloat(cat.kg || 0);
                  const pct = totalCollectedKg > 0 ? ((kg / totalCollectedKg) * 100).toFixed(1) : '25.0';
                  const colorClass = cat.waste_type === 'plastic' ? 'bg-amber-500' :
                    cat.waste_type === 'dry_waste' ? 'bg-blue-600' :
                    cat.waste_type === 'e_waste' ? 'bg-purple-600' : 'bg-secondary';

                  return (
                    <div key={cat.waste_type}>
                      <div className="flex justify-between items-center text-body-sm font-body-sm mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-sm ${colorClass}`}></span>
                          <span className="font-medium text-on-surface">{formatWasteType(cat.waste_type)}</span>
                        </div>
                        <div className="font-mono font-semibold text-on-surface">
                          {kg.toFixed(1)} kg <span className="text-outline font-normal text-label-sm">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                        <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
              <span>Contamination rate: <strong className="text-primary font-semibold">1.4%</strong> (Target &lt; 3.0%)</span>
              <span className="text-secondary font-title-md flex items-center gap-1">
                <span>ISO 14001 Audited</span>
                <span className="material-symbols-outlined text-sm">verified</span>
              </span>
            </div>
          </div>

          {/* Regional Depot Capacity Gauges & Hub Health (5 cols) */}
          <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-title-md font-title-md text-primary">Depot Capacity &amp; Hub Health</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">Real-time fill indicators for regional compaction hubs</p>
                </div>
                <span className="material-symbols-outlined text-outline">warehouse</span>
              </div>

              {/* Segmented Gauges */}
              <div className="mt-5 space-y-4">
                {/* Depot 1: Whitefield Hub */}
                <div className="p-3.5 rounded-lg border border-outline-variant/60 bg-surface-container-low/40">
                  <div className="flex justify-between items-center mb-1.5">
                    <div>
                      <span className="font-title-md text-on-surface text-body-md font-semibold">Whitefield Recycling Depot</span>
                      <p className="text-label-sm font-label-sm text-outline">Zone 4 • Semi-Static Compactor #2</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-label-sm font-label-sm bg-amber-50 text-amber-900 border border-amber-300 font-bold">
                      84% FULL
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden mt-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                  <div className="flex justify-between items-center text-label-sm font-label-sm text-on-surface-variant mt-2">
                    <span>Capacity: 8.4T / 10T</span>
                    <span className="text-amber-700 font-semibold">Dispatched transfer truck</span>
                  </div>
                </div>

                {/* Depot 2: Koramangala Hub */}
                <div className="p-3.5 rounded-lg border border-outline-variant/60 bg-surface-container-low/40">
                  <div className="flex justify-between items-center mb-1.5">
                    <div>
                      <span className="font-title-md text-on-surface text-body-md font-semibold">Koramangala Transfer Hub</span>
                      <p className="text-label-sm font-label-sm text-outline">Zone 1 • Sorting Facility &amp; Baler</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-label-sm font-label-sm bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold">
                      52% NORMAL
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden mt-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '52%' }}></div>
                  </div>
                  <div className="flex justify-between items-center text-label-sm font-label-sm text-on-surface-variant mt-2">
                    <span>Capacity: 3.1T / 6.0T</span>
                    <span className="text-secondary font-semibold">Normal Intake Velocity</span>
                  </div>
                </div>

                {/* Depot 3: Peenya Industrial Compactor */}
                <div className="p-3.5 rounded-lg border border-outline-variant/60 bg-surface-container-low/40">
                  <div className="flex justify-between items-center mb-1.5">
                    <div>
                      <span className="font-title-md text-on-surface text-body-md font-semibold">Peenya Cleantech Baler</span>
                      <p className="text-label-sm font-label-sm text-outline">Zone 3 • Heavy E-Waste &amp; Polymers</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-label-sm font-label-sm bg-blue-50 text-blue-900 border border-blue-300 font-bold">
                      38% OPTIMAL
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '38%' }}></div>
                  </div>
                  <div className="flex justify-between items-center text-label-sm font-label-sm text-on-surface-variant mt-2">
                    <span>Capacity: 4.5T / 12T</span>
                    <span className="text-primary font-semibold">Available Payload Bandwidth</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
              <span>Next automated telemetry cycle in 45s</span>
              <span className="text-primary font-title-md">Hub 04 Online</span>
            </div>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
