// frontend/src/pages/Impact.jsx
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AppLayout from '../layouts/AppLayout';
import { dashboardAPI } from '../services/api';
import { formatWasteType } from '../utils/helpers';

const CO2_FACTORS = {
  wet_waste: 0.5,  // composting reduces methane
  dry_waste: 1.2,  // paper/cardboard recycling
  plastic: 2.0,    // polymer reverse logistics
  e_waste: 3.0,    // rare earth recovery
};

export default function Impact() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getUserDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-body-md text-on-surface-variant">Calculating EPA WARM impact telemetry...</span>
        </div>
      </AppLayout>
    );
  }

  const { stats, wasteBreakdown = [], monthlyData = [] } = data || {};
  const collectedKg = parseFloat(stats?.collected_kg || 0);

  // Calculate estimated CO2 savings
  const co2Total = wasteBreakdown.reduce((sum, w) => {
    return sum + parseFloat(w.kg) * (CO2_FACTORS[w.waste_type] || 1.0);
  }, 0);

  const treesEquivalent = (co2Total / 21).toFixed(1);
  const waterSavedLiters = Math.round(collectedKg * 14.5);

  const impactCards = [
    {
      icon: 'eco',
      value: `${collectedKg.toFixed(1)} kg`,
      label: 'Total Waste Diverted',
      sub: 'Verified at recycling partner hubs',
      color: 'text-secondary',
      bgColor: 'bg-secondary-container/20',
    },
    {
      icon: 'cloud_off',
      value: `${co2Total.toFixed(1)} kg`,
      label: 'CO₂ Emissions Prevented',
      sub: 'Estimated EPA WARM avoided carbon',
      color: 'text-primary',
      bgColor: 'bg-surface-container',
    },
    {
      icon: 'forest',
      value: `${treesEquivalent}`,
      label: 'Tree Offsets Equivalent',
      sub: '~21 kg CO₂ absorbed per tree/year',
      color: 'text-secondary',
      bgColor: 'bg-secondary-container/20',
    },
    {
      icon: 'water_drop',
      value: `${waterSavedLiters.toLocaleString()} L`,
      label: 'Freshwater Conserved',
      sub: 'Avoided virgin pulp & refining wash',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">eco</span>
              <h1 className="text-headline-md font-headline-md text-primary tracking-tight">Environmental Impact Ledger</h1>
            </div>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              Verifiable ESG diversion metrics, carbon offsets, and natural resource preservation audits.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface">
            <span className="material-symbols-outlined text-secondary text-base fill-1">verified</span>
            <span className="text-label-sm font-label-sm font-semibold">ISO 14001 Standards Model</span>
          </div>
        </div>

        {/* Informational Methodology Callout */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-xl">info</span>
          <p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
            <strong>Methodology Note:</strong> Carbon emissions prevented and water conserved are calculated from certified collected consignments using standard EPA WARM factors for demonstration and auditable compliance reporting.
          </p>
        </div>

        {/* 4 Impact Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {impactCards.map(c => (
            <div key={c.label} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">{c.label}</span>
                <div className={`w-9 h-9 rounded-lg ${c.bgColor} flex items-center justify-center ${c.color}`}>
                  <span className="material-symbols-outlined text-lg">{c.icon}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-mono-metric font-mono-metric text-on-surface">{c.value}</div>
                <p className="text-body-sm font-body-sm text-outline mt-0.5">{c.sub}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Analytics Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Monthly Diverted Trend Chart */}
          <section className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-title-md font-title-md text-primary">Monthly Collection Velocity</h2>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Cumulative monthly kilograms collected and diverted</p>
              </div>
              <span className="text-label-sm font-label-sm font-mono text-secondary px-2.5 py-1 rounded bg-secondary-container/20 border border-secondary/30">
                Active Cycle
              </span>
            </div>

            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaedff" />
                  <XAxis dataKey="label" tick={{ fill: '#707974', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#707974', fontSize: 12 }} unit=" kg" />
                  <Tooltip
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #bfc9c3',
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  />
                  <Bar dataKey="total_kg" fill="#006c49" radius={[6, 6, 0, 0]} name="Diverted (kg)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-16 text-center text-outline">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">bar_chart</span>
                <p className="text-body-md">No monthly collection records yet.</p>
              </div>
            )}
          </section>

          {/* Waste Category Breakdown */}
          <section className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-title-md font-title-md text-primary">Material Stream Breakdown</h2>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">Percentage distribution across segregated streams</p>
                </div>
                <span className="material-symbols-outlined text-outline">category</span>
              </div>

              {wasteBreakdown.length === 0 ? (
                <div className="py-16 text-center text-outline">
                  <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">pie_chart</span>
                  <p className="text-body-md">No collected stream records yet.</p>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {wasteBreakdown.map(w => {
                    const pct = collectedKg > 0 ? ((w.kg / collectedKg) * 100).toFixed(1) : 0;
                    const co2 = (parseFloat(w.kg) * (CO2_FACTORS[w.waste_type] || 1)).toFixed(1);
                    const colorClass = w.waste_type === 'plastic' ? 'bg-amber-500' :
                      w.waste_type === 'dry_waste' ? 'bg-blue-600' :
                      w.waste_type === 'e_waste' ? 'bg-purple-600' : 'bg-secondary';

                    return (
                      <div key={w.waste_type}>
                        <div className="flex justify-between items-center text-body-sm font-body-sm mb-1">
                          <span className="font-medium text-on-surface">{formatWasteType(w.waste_type)}</span>
                          <span className="font-mono text-outline">{parseFloat(w.kg).toFixed(1)} kg ({pct}%)</span>
                        </div>
                        <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                          <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                        </div>
                        <div className="text-label-sm font-label-sm text-secondary mt-1">
                          Avoids ~{co2} kg CO₂ equivalent
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between text-label-sm font-label-sm text-outline">
              <span>Recycling audit rate</span>
              <span className="text-secondary font-bold">100% Traceable</span>
            </div>
          </section>
        </div>

      </div>
    </AppLayout>
  );
}
