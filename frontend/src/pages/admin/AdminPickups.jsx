// frontend/src/pages/admin/AdminPickups.jsx
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { adminAPI } from '../../services/api';
import { formatWasteType, formatDate, getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_TRANSITIONS = {
  pending:  ['approved', 'rejected'],
  approved: ['collected', 'rejected'],
  collected: [],
  rejected: [],
  cancelled: [],
};

const STATUS_LABELS = {
  approved: 'Quick Approve',
  rejected: 'Reject',
  collected: 'Mark Collected',
};

export default function AdminPickups() {
  const [pickups, setPickups] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', waste_type: '', search: '' });
  const [updating, setUpdating] = useState(null);

  const fetchPickups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllPickups({ ...filters, page, limit: 12 });
      setPickups(res.data.pickups || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchPickups();
  }, [fetchPickups]);

  async function handleStatusChange(id, currentStatus, newStatus) {
    setUpdating(id);
    try {
      await adminAPI.updatePickupStatus(id, newStatus);
      toast.success(`Consignment #ET-${id} updated to "${newStatus}"!`);
      fetchPickups();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setUpdating(null);
    }
  }

  const pages = Math.ceil(total / 12);

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">pending_actions</span>
              <h1 className="text-headline-md font-headline-md text-primary tracking-tight">Pickup Consignment Queue</h1>
            </div>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              Verify, route, approve and audit municipal waste pickup consignments across active operational zones.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-label-sm font-label-sm font-semibold">{total} Total Consignments</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <section className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-lg">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-outline">
                <span className="material-symbols-outlined text-lg">search</span>
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 placeholder:text-outline-variant"
                placeholder="Search by User Name, Email, or Address..."
                value={filters.search}
                onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                className="px-3 py-2 bg-surface-container-lowest text-on-surface border border-outline rounded-lg text-body-md font-body-md focus:border-secondary"
                value={filters.status}
                onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Driver Assigned / Approved</option>
                <option value="collected">Collected &amp; Weighed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                className="px-3 py-2 bg-surface-container-lowest text-on-surface border border-outline rounded-lg text-body-md font-body-md focus:border-secondary"
                value={filters.waste_type}
                onChange={e => { setFilters(f => ({ ...f, waste_type: e.target.value })); setPage(1); }}
              >
                <option value="">All Streams</option>
                <option value="wet_waste">Wet / Organic Waste</option>
                <option value="dry_waste">Dry / Paper &amp; Cardboard</option>
                <option value="plastic">Plastic Packaging</option>
                <option value="e_waste">Electronic Waste</option>
              </select>
            </div>
          </div>
        </section>

        {/* Consignment Table */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-body-md text-on-surface-variant">Syncing triage records...</span>
            </div>
          ) : pickups.length === 0 ? (
            <div className="p-12 text-center text-outline">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">local_shipping</span>
              <p className="text-body-md">No pickup requests match the selected parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant border-b border-outline-variant text-label-sm font-label-sm uppercase tracking-wider">
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Generator &amp; Contact</th>
                    <th className="py-3 px-4">Waste Stream &amp; Wt</th>
                    <th className="py-3 px-4">Dispatch Slot &amp; Address</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-body-md font-body-md">
                  {pickups.map(p => {
                    const allowed = STATUS_TRANSITIONS[p.status] || [];
                    const isPending = p.status === 'pending';
                    const isApproved = p.status === 'approved';
                    const isCollected = p.status === 'collected';
                    const isRejected = p.status === 'rejected';

                    return (
                      <tr key={p.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-primary">
                          #ET-{p.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-title-md text-on-surface text-body-md">{p.user_name}</div>
                          <div className="text-label-sm font-label-sm text-on-surface-variant">{p.user_email}</div>
                          {p.user_phone && <div className="text-label-sm font-label-sm text-outline">{p.user_phone}</div>}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-block w-2.5 h-2.5 rounded-sm ${
                              p.waste_type === 'plastic' ? 'bg-emerald-600' :
                              p.waste_type === 'dry_waste' ? 'bg-blue-600' :
                              p.waste_type === 'e_waste' ? 'bg-purple-600' : 'bg-secondary'
                            }`}></span>
                            <span className="font-semibold text-on-surface">{formatWasteType(p.waste_type)}</span>
                          </div>
                          <div className="text-label-sm font-label-sm text-on-surface-variant font-mono font-medium">
                            {p.quantity_kg} kg Net
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-on-surface font-medium">{formatDate(p.pickup_date)} • {p.pickup_time?.slice(0, 5) || '09:00'}</div>
                          <div className="text-label-sm font-label-sm text-outline truncate max-w-[220px]" title={p.pickup_address}>
                            {p.pickup_address}
                          </div>
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
                            {allowed.map(status => (
                              <button
                                key={status}
                                id={`admin-pickup-${p.id}-${status}`}
                                type="button"
                                disabled={updating === p.id}
                                onClick={() => handleStatusChange(p.id, p.status, status)}
                                className={`px-2.5 py-1 text-label-sm font-label-sm rounded font-semibold transition-all cursor-pointer ${
                                  status === 'rejected'
                                    ? 'bg-error-container text-on-error-container hover:bg-error-container/80'
                                    : status === 'collected'
                                    ? 'bg-primary-container text-on-primary hover:bg-secondary'
                                    : 'bg-primary text-on-primary hover:bg-primary-container'
                                }`}
                              >
                                {updating === p.id ? '...' : STATUS_LABELS[status]}
                              </button>
                            ))}
                            {allowed.length === 0 && (
                              <span className="text-label-sm font-label-sm font-mono text-outline px-2 py-1">Audited</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="px-6 py-3 border-t border-outline-variant bg-surface-container-low/30 flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
              <div>Page {page} of {pages}</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 rounded border border-outline-variant bg-surface-container-lowest text-on-surface disabled:opacity-50 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="px-2.5 py-1 rounded border border-outline-variant bg-surface-container-lowest text-on-surface disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

      </div>
    </AppLayout>
  );
}
