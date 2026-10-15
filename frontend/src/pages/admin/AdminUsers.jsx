// frontend/src/pages/admin/AdminUsers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { adminAPI } from '../../services/api';
import { formatDateTime, getApiError } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllUsers({ search, page, limit: 12 });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const pages = Math.ceil(total / 12);

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">group</span>
              <h1 className="text-headline-md font-headline-md text-primary tracking-tight">Citizen &amp; Commercial Directory</h1>
            </div>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              Registered waste generators, cumulative diversion scorecards, and platform roles.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-label-sm font-label-sm font-semibold">{total} Registered Generators</span>
          </div>
        </div>

        {/* Search Toolbar */}
        <section className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-outline">
              <span className="material-symbols-outlined text-lg">search</span>
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 placeholder:text-outline-variant"
              placeholder="Search by Citizen Name or Email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <span className="text-label-sm font-label-sm text-outline hidden sm:inline-block">Showing page {page} of {Math.max(1, pages)}</span>
        </section>

        {/* Users Table */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-body-md text-on-surface-variant">Loading user directory...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-outline">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">person_search</span>
              <p className="text-body-md">No matching users found in current scope.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant border-b border-outline-variant text-label-sm font-label-sm uppercase tracking-wider">
                    <th className="py-3 px-4">UID</th>
                    <th className="py-3 px-4">Citizen Name &amp; Address</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-center">Pickups</th>
                    <th className="py-3 px-4">EcoPoints</th>
                    <th className="py-3 px-4">Member Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-body-md font-body-md">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-outline text-label-sm">
                        #{u.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-title-md text-on-surface text-body-md flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold">
                            {u.name?.slice(0, 2).toUpperCase() || 'US'}
                          </div>
                          <span>{u.name}</span>
                        </div>
                        {u.address && (
                          <div className="text-label-sm font-label-sm text-outline truncate max-w-[200px] mt-0.5" title={u.address}>
                            {u.address}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant font-mono text-body-sm">
                        {u.phone || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold ${
                          u.role === 'admin'
                            ? 'bg-primary-container text-on-primary'
                            : 'bg-surface-container text-on-surface-variant border border-outline-variant'
                        }`}>
                          {u.role === 'admin' ? 'Operations Admin' : 'Resident'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-primary">
                        {u.total_pickups || 0}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-secondary">
                        +{u.reward_points || 0} pts
                      </td>
                      <td className="py-3.5 px-4 text-label-sm font-label-sm text-outline">
                        {formatDateTime(u.created_at)}
                      </td>
                    </tr>
                  ))}
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
