// frontend/src/pages/Rewards.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { rewardsAPI } from '../services/api';
import { formatWasteType, formatDateTime } from '../utils/helpers';

export default function Rewards() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rewardsAPI.getMyRewards()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-body-md text-on-surface-variant">Loading rewards ledger...</span>
        </div>
      </AppLayout>
    );
  }

  const { total_points = 0, history = [], vouchers = [] } = data || {};
  const nextVoucher = vouchers.find(v => v.points_required > total_points) || vouchers[vouchers.length - 1];
  const progress = nextVoucher ? Math.min((total_points / nextVoucher.points_required) * 100, 100) : 100;

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">military_tech</span>
              <h1 className="text-headline-md font-headline-md text-primary tracking-tight">EcoRewards &amp; Badges</h1>
            </div>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              Earn EcoPoints for verified segregated pickups and redeem utility credits and eco-vouchers.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-secondary-container/20 border border-secondary/30 px-3.5 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-secondary text-base fill-1">verified</span>
            <span className="text-label-md font-label-md text-primary font-bold">Tier 2 EcoHero Status</span>
          </div>
        </div>

        {/* Hero Points Card */}
        <section className="bg-primary-container text-on-primary rounded-2xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-secondary/10 pointer-events-none rounded-r-2xl"></div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="text-label-sm font-label-sm uppercase tracking-wider text-inverse-primary font-bold">
                Available Wallet Balance
              </span>
              <div className="text-display font-display tracking-tight text-on-primary mt-1 flex items-baseline gap-2">
                {total_points.toLocaleString()}
                <span className="text-headline-sm font-headline-sm font-normal text-inverse-primary">EcoPoints</span>
              </div>
              <p className="text-body-md text-on-primary-container mt-1">
                Equivalent to ~₹{(total_points * 0.5).toFixed(0)} in utility rebates and green mobility passes.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3">
              <Link
                to="/schedule"
                className="bg-secondary text-on-secondary py-2.5 px-5 rounded-xl font-title-md text-title-md hover:bg-secondary/90 transition-all shadow-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">add_circle</span>
                <span>Earn More Points</span>
              </Link>
              <span className="text-label-sm text-on-primary-container">
                Demo rewards environment • 10-25 pts / kg verified
              </span>
            </div>
          </div>

          {/* Progress bar to next reward */}
          {nextVoucher && (
            <div className="mt-8 pt-6 border-t border-inverse-primary/20">
              <div className="flex justify-between items-center text-label-md font-label-md mb-2">
                <span>Progress to next perk: <strong>{nextVoucher.name}</strong></span>
                <span>{total_points} / {nextVoucher.points_required} pts ({progress.toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-primary h-2 rounded-full overflow-hidden">
                <div
                  className="bg-secondary-container h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </section>

        {/* Voucher Catalog Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-title-md font-title-md text-primary">Redeemable Eco-Vouchers</h2>
              <p className="text-body-sm font-body-sm text-on-surface-variant">Unlock green rewards as your cumulative segregation points grow</p>
            </div>
            <span className="text-label-sm font-label-sm text-outline">{vouchers.length} Rewards Cataloged</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vouchers.map(v => {
              const unlocked = total_points >= v.points_required;
              return (
                <div
                  key={v.name}
                  className={`bg-surface-container-lowest rounded-xl border p-6 flex flex-col justify-between transition-all ${
                    unlocked
                      ? 'border-secondary/50 shadow-sm'
                      : 'border-outline-variant opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        unlocked ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-outline'
                      }`}>
                        <span className="material-symbols-outlined text-2xl fill-1">
                          {unlocked ? 'card_giftcard' : 'lock'}
                        </span>
                      </div>
                      <span className={`text-label-sm font-label-sm font-bold px-2.5 py-1 rounded-full ${
                        unlocked ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-outline'
                      }`}>
                        {v.points_required} PTS
                      </span>
                    </div>

                    <h3 className="text-title-md font-title-md text-on-surface">{v.name}</h3>
                    <p className="text-body-sm font-body-sm text-on-surface-variant mt-1 leading-snug">
                      {v.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-outline-variant/60 flex items-center justify-between">
                    <span className={`text-label-sm font-label-sm font-semibold ${unlocked ? 'text-secondary' : 'text-outline'}`}>
                      {unlocked ? '✓ Unlocked & Claimable' : `${v.points_required - total_points} more pts required`}
                    </span>
                    <button
                      type="button"
                      disabled={!unlocked}
                      className={`px-3 py-1.5 rounded-lg text-label-md font-title-md transition-colors ${
                        unlocked
                          ? 'bg-primary-container text-on-primary hover:bg-secondary cursor-pointer'
                          : 'bg-surface-container text-outline cursor-not-allowed'
                      }`}
                    >
                      {unlocked ? 'Redeem' : 'Locked'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Ledger History */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low/50">
            <div>
              <h2 className="text-title-md font-title-md text-primary">Points Credit Ledger</h2>
              <p className="text-body-sm font-body-sm text-on-surface-variant">Verified scale deposits credited to your account</p>
            </div>
            <span className="text-label-sm font-label-sm text-outline">{history.length} Transactions</span>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center text-outline">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">account_balance_wallet</span>
              <p className="text-body-md">No points transactions recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant border-b border-outline-variant text-label-sm font-label-sm uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Transaction Details</th>
                    <th className="py-3 px-4">Waste Stream</th>
                    <th className="py-3 px-4 text-right">Points Credited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-body-md font-body-md">
                  {history.map(r => (
                    <tr key={r.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3.5 px-4 text-label-sm font-label-sm text-outline">
                        {formatDateTime(r.created_at)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-on-surface">
                        {r.description}
                      </td>
                      <td className="py-3.5 px-4">
                        {r.waste_type ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-secondary"></span>
                            <span className="text-body-sm">{formatWasteType(r.waste_type)}</span>
                          </span>
                        ) : (
                          <span className="text-outline">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-secondary">
                        +{r.points} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </AppLayout>
  );
}
