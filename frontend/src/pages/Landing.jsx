// frontend/src/pages/Landing.jsx
// Preserved exact Stitch design for EcoTrack — Marketing Landing Page
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Interactive slider state for real-time ESG calculator
  const [wasteAmount, setWasteAmount] = useState(500);
  const [openFaq, setOpenFaq] = useState(null);

  // Dynamic calculations based on EPA WARM model factors
  const diversionKg = Math.round(wasteAmount * 0.85);
  const carbonMt = (wasteAmount * 0.00256).toFixed(2);
  const treesCount = Math.round(wasteAmount * 0.036);
  const ecoCredits = Math.round(wasteAmount * 5);
  const marketplaceVal = Math.round(ecoCredits * 0.03);

  function toggleFaq(index) {
    setOpenFaq(openFaq === index ? null : index);
  }

  const faqs = [
    {
      q: 'How are collector vehicles and personnel verified?',
      a: 'All EcoTrack fleet haulers are background-checked, insured, and equipped with calibrated IoT digital scales. Real-time GPS location is published directly to your dashboard during your active dispatch window.'
    },
    {
      q: 'What happens if our materials have minor contamination?',
      a: 'Our collectors conduct a quick 30-second inspection at collection. Minor contamination is logged with educational guidance tips pushed to your account. Consistently clean segregators receive bonus multiplier EcoCredits.'
    },
    {
      q: 'Can large corporate offices integrate with our existing ESG reporting?',
      a: 'Yes. Enterprise accounts get access to automated monthly CSV and PDF Scope 3 reverse supply chain audits certified for BRSR and global GRI sustainability reporting.'
    },
    {
      q: 'How do EcoCredits translate to tangible utility rewards?',
      a: 'EcoCredits can be redeemed for sustainable merchandise discounts, municipal utility credits, or converted into verified corporate tree planting contributions.'
    }
  ];

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen">
      {/* TOP APP BAR */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md shadow-sm border-b border-outline-variant/60">
        <div className="flex justify-between items-center w-full px-6 md:px-8 py-3.5 max-w-7xl mx-auto">
          {/* Brand Anchor */}
          <Link to="/" className="text-title-md font-title-md text-primary flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-secondary-fixed shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-xl">eco</span>
            </span>
            <span className="font-extrabold text-title-md tracking-tight text-primary">EcoTrack</span>
          </Link>

          {/* Desktop Nav Cluster */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8">
            <a className="text-primary font-semibold border-b-2 border-primary pb-0.5 text-body-md transition-colors" href="#home">Home</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-body-md" href="#how-it-works">How It Works</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-body-md" href="#categories">Categories</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-body-md" href="#impact-calc">Impact Calculator</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors text-body-md" href="#about">About</a>
          </nav>

          {/* Trailing Action Cluster */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary text-body-md font-semibold px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">dashboard</span>
                <span>My Portal</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-on-surface-variant hover:text-primary font-semibold text-body-md px-3 py-2 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary text-body-md font-semibold px-4 py-2 rounded-lg shadow-sm transition-all duration-150 active:scale-95"
                >
                  <span>Schedule Pickup</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 md:pt-16 md:pb-24 overflow-hidden bg-gradient-to-b from-surface-container-lowest via-surface-bright to-background" id="home">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Hero Copy Left (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Regulatory / Trust Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant text-primary text-label-md font-medium">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span>Next-Gen Smart Reverse Supply Chain</span>
                  <span className="text-outline">|</span>
                  <span className="text-secondary font-semibold">ISO 14001 Audited</span>
                </div>

                <h1 className="text-display-mobile md:text-display font-display text-primary tracking-tight leading-tight">
                  Turn Waste Into a <br className="hidden sm:block" />
                  <span className="text-secondary">Better Tomorrow.</span>
                </h1>

                <p className="text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                  Precision automated doorstep pickups for residential high-rises, collegiate campuses, and corporate campuses across metropolitan hubs. Track traceability, reclaim raw circular value, and achieve certified net-zero goals.
                </p>

                {/* Dual CTA Cluster */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <Link
                    to={user ? "/schedule" : "/login"}
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-semibold text-title-md px-7 py-3.5 rounded-lg shadow-md transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined">local_shipping</span>
                    <span>Schedule a Pickup</span>
                  </Link>
                  <a
                    href="#impact-calc"
                    className="inline-flex items-center justify-center gap-2.5 bg-surface-container-lowest border border-outline-variant text-primary font-semibold text-title-md px-6 py-3.5 rounded-lg shadow-sm hover:bg-surface-container-low transition-all"
                  >
                    <span className="w-6 h-6 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                    </span>
                    <span>Explore Live Impact</span>
                  </a>
                </div>

                {/* Floating Micro-Metric Badges */}
                <div className="pt-4 grid grid-cols-2 gap-4 max-w-lg">
                  <div className="flex items-center gap-3.5 p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary shrink-0">
                      <span className="material-symbols-outlined text-xl">recycling</span>
                    </div>
                    <div>
                      <div className="text-body-sm text-on-surface-variant font-medium">Diverted this Month</div>
                      <div className="text-title-md font-bold text-primary">14,820 kg</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-xl">star</span>
                    </div>
                    <div>
                      <div className="text-body-sm text-on-surface-variant font-medium">Collector Rating</div>
                      <div className="text-title-md font-bold text-primary">4.9/5 <span className="text-label-sm font-normal text-outline">(1,240 rev)</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Media Graphic / Bento Panel (5 cols) */}
              <div className="lg:col-span-5 relative">
                <div className="relative bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-lg overflow-hidden">
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-surface-container">
                    <img
                      className="w-full h-full object-cover"
                      alt="Modern cleantech logistics dispatch facility"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPToPLpthkIkg7mle7-b1Lb5YcbRSztMyHfaA-8GjIXpOfSRG4ZM4jU21F3tPFPX0FlpMJYYlfAdbFPbzqXFzCD7D_s3_26nJI35JBBIXQ2iVG5kvfPxEE-oLiw7P5x3CIJR5JmzGN0xgevTWt5GJMenilluDPHbFBdpcwjlac52iKP_V0K0UaVWuH5UGRJv0XEdYPk3czLpu-SOctlqN2n6bcH3-tcY-Wcvc-zQZV-TdmkNXP0mjv"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-primary">
                      <div>
                        <p className="text-label-sm uppercase tracking-wider text-secondary-container font-semibold">Metro Route Hub</p>
                        <p className="text-title-md font-bold">Downtown Hub — Fleet Alpha</p>
                      </div>
                      <span className="px-2.5 py-1 bg-surface-container-lowest/20 backdrop-blur-md rounded text-label-sm font-mono border border-white/20 font-bold">
                        LIVE GPS
                      </span>
                    </div>
                  </div>

                  {/* Realtime Dispatch Subcard */}
                  <div className="mt-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-secondary animate-ping"></div>
                      <div>
                        <h4 className="text-title-md font-bold text-primary">Smart Route #402 En Route</h4>
                        <p className="text-body-sm text-on-surface-variant">Estimated Arrival: 14 mins to Tech Hub B</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-sm font-bold">
                      Active
                    </span>
                  </div>
                </div>

                {/* Subtle background glow */}
                <div className="absolute -z-10 -top-8 -right-8 w-64 h-64 bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none"></div>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE IMPACT TICKER */}
        <section className="py-10 bg-surface-container-lowest border-y border-outline-variant/60">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-label-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span>Operational Metrics</span>
                </div>
                <h3 className="text-headline-sm font-bold text-primary mt-1">Aggregated Cleantech Operational Ledger</h3>
              </div>
              <span className="text-body-sm text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-secondary">update</span>
                Synced live from telemetry collection nodes
              </span>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-xl bg-surface-bright border border-outline-variant/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-label-md text-on-surface-variant font-medium">Total Recycled Waste</span>
                  <span className="material-symbols-outlined text-secondary">inventory_2</span>
                </div>
                <div className="text-mono-metric font-mono-metric text-primary">84.6 <span className="text-body-md font-normal text-on-surface-variant">Tons</span></div>
                <div className="mt-2 text-label-sm text-secondary flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-xs">trending_up</span>
                  <span>+18.4% vs last cycle</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-surface-bright border border-outline-variant/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-label-md text-on-surface-variant font-medium">Carbon Offset</span>
                  <span className="material-symbols-outlined text-secondary">cloud_off</span>
                </div>
                <div className="text-mono-metric font-mono-metric text-primary">128.4 <span className="text-body-md font-normal text-on-surface-variant">MT CO2e</span></div>
                <div className="mt-2 text-label-sm text-secondary flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  <span>Verified Gold Standard</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-surface-bright border border-outline-variant/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-label-md text-on-surface-variant font-medium">Verified Hubs</span>
                  <span className="material-symbols-outlined text-secondary">domain</span>
                </div>
                <div className="text-mono-metric font-mono-metric text-primary">1,420+</div>
                <div className="mt-2 text-label-sm text-on-surface-variant font-medium">
                  <span>Campuses & Towers</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-surface-bright border border-outline-variant/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-label-md text-on-surface-variant font-medium">Circular Facilities</span>
                  <span className="material-symbols-outlined text-secondary">factory</span>
                </div>
                <div className="text-mono-metric font-mono-metric text-primary">18 <span className="text-body-md font-normal text-on-surface-variant">Plants</span></div>
                <div className="mt-2 text-label-sm text-secondary flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  <span>100% Traceable Endpoints</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-STEP PROCESS SECTION */}
        <section className="py-20 bg-background" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/30 text-secondary text-label-sm font-semibold">
                <span className="material-symbols-outlined text-sm">account_tree</span>
                <span>END-TO-END REVERSE WORKFLOW</span>
              </div>
              <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-primary tracking-tight">
                How EcoTrack Works in 3 Simple Steps
              </h2>
              <p className="text-body-lg text-on-surface-variant">
                From your doorstep bin to authenticated circular recycling plants—our digital platform closes the loop with absolute verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant flex flex-col justify-between hover:shadow-md transition-shadow relative group">
                <div className="absolute top-6 right-6 text-display font-display text-surface-container-high/60 select-none">01</div>
                <div>
                  <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-2xl">alt_route</span>
                  </div>
                  <h3 className="text-headline-sm font-bold text-primary mb-3">Segregate at Source</h3>
                  <p className="text-body-md text-on-surface-variant leading-relaxed mb-6">
                    Split streams cleanly using color-coded guidelines for wet compostable organics, clean fiber paper, categorized plastics, and e-waste.
                  </p>
                </div>
                <div className="pt-4 border-t border-outline-variant/40 space-y-2">
                  <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-secondary">check_small</span>
                    <span>QR Bin Tags provided for campuses</span>
                  </div>
                  <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-secondary">check_small</span>
                    <span>Doorstep purity inspection check</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant flex flex-col justify-between hover:shadow-md transition-shadow relative group">
                <div className="absolute top-6 right-6 text-display font-display text-surface-container-high/60 select-none">02</div>
                <div>
                  <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-2xl">calendar_month</span>
                  </div>
                  <h3 className="text-headline-sm font-bold text-primary mb-3">One-Tap Scheduled Pickup</h3>
                  <p className="text-body-md text-on-surface-variant leading-relaxed mb-6">
                    Pick your preferred pickup window via our web console. Our optimized dispatch engine routes the closest verified electric hauler.
                  </p>
                </div>
                <div className="pt-4 border-t border-outline-variant/40 space-y-2">
                  <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-secondary">check_small</span>
                    <span>Live GPS driver tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-secondary">check_small</span>
                    <span>Zero emission electric fleet</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant flex flex-col justify-between hover:shadow-md transition-shadow relative group">
                <div className="absolute top-6 right-6 text-display font-display text-surface-container-high/60 select-none">03</div>
                <div>
                  <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-2xl">military_tech</span>
                  </div>
                  <h3 className="text-headline-sm font-bold text-primary mb-3">Earn EcoCredits & Track Offset</h3>
                  <p className="text-body-md text-on-surface-variant leading-relaxed mb-6">
                    Get weighed onsite with instant digital weighbridge receipts. Accumulate EcoCredits redeemable for vouchers and track verified ESG carbon savings.
                  </p>
                </div>
                <div className="pt-4 border-t border-outline-variant/40 space-y-2">
                  <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-secondary">check_small</span>
                    <span>Downloadable ESG Scope 3 audit slips</span>
                  </div>
                  <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-secondary">check_small</span>
                    <span>Gamified tier rewards & vouchers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE WASTE CATEGORIES */}
        <section className="py-20 bg-surface-container-lowest border-t border-outline-variant/60" id="categories">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-primary text-label-sm font-semibold mb-3">
                  <span className="material-symbols-outlined text-sm">category</span>
                  <span>SEGREGATION TAXONOMY</span>
                </div>
                <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-primary tracking-tight">
                  Supported Waste Streams & Processing Value
                </h2>
              </div>
              <p className="text-body-md text-on-surface-variant max-w-md">
                Verified secondary processing partner specs, circular conversion rates, and current salvage yield values.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category 1 */}
              <div className="bg-surface-bright rounded-2xl p-6 border border-outline-variant hover:border-secondary transition-all hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                    <span className="material-symbols-outlined text-2xl">compost</span>
                  </span>
                  <span className="px-2.5 py-1 bg-surface-container-lowest text-primary text-label-sm font-semibold rounded-full border border-outline-variant">
                    Wet / Organic
                  </span>
                </div>
                <h3 className="text-headline-sm font-bold text-primary mb-1">Organic & Food Scraps</h3>
                <p className="text-body-sm text-on-surface-variant mb-4">Aerobic high-temp bio-methanation and organic micro-composting facilities.</p>
                <div className="space-y-3 pt-3 border-t border-outline-variant/40">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant">Reward Value:</span>
                    <span className="font-bold text-primary">10 pts / kg</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-label-sm mb-1 text-on-surface-variant">
                      <span>Conversion Efficiency</span>
                      <span className="font-semibold text-secondary">92%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category 2 */}
              <div className="bg-surface-bright rounded-2xl p-6 border border-outline-variant hover:border-secondary transition-all hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                    <span className="material-symbols-outlined text-2xl">newspaper</span>
                  </span>
                  <span className="px-2.5 py-1 bg-surface-container-lowest text-primary text-label-sm font-semibold rounded-full border border-outline-variant">
                    Dry / Fiber
                  </span>
                </div>
                <h3 className="text-headline-sm font-bold text-primary mb-1">Paper & Corrugated</h3>
                <p className="text-body-sm text-on-surface-variant mb-4">De-inked pulping and conversion into 100% recycled packaging carton board.</p>
                <div className="space-y-3 pt-3 border-t border-outline-variant/40">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant">Reward Value:</span>
                    <span className="font-bold text-primary">10 pts / kg</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-label-sm mb-1 text-on-surface-variant">
                      <span>Conversion Efficiency</span>
                      <span className="font-semibold text-secondary">78%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category 3 */}
              <div className="bg-surface-bright rounded-2xl p-6 border border-outline-variant hover:border-secondary transition-all hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                    <span className="material-symbols-outlined text-2xl">water_bottle</span>
                  </span>
                  <span className="px-2.5 py-1 bg-surface-container-lowest text-primary text-label-sm font-semibold rounded-full border border-outline-variant">
                    Plastics #1-#7
                  </span>
                </div>
                <h3 className="text-headline-sm font-bold text-primary mb-1">Polymer Resins</h3>
                <p className="text-body-sm text-on-surface-variant mb-4">Optical sorting and clean washing into food-grade rPET and rHDPE resin pellets.</p>
                <div className="space-y-3 pt-3 border-t border-outline-variant/40">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant">Reward Value:</span>
                    <span className="font-bold text-primary">10 pts / kg</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-label-sm mb-1 text-on-surface-variant">
                      <span>Conversion Efficiency</span>
                      <span className="font-semibold text-secondary">84%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category 4 */}
              <div className="bg-surface-bright rounded-2xl p-6 border border-outline-variant hover:border-secondary transition-all hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                    <span className="material-symbols-outlined text-2xl">memory</span>
                  </span>
                  <span className="px-2.5 py-1 bg-surface-container-lowest text-primary text-label-sm font-semibold rounded-full border border-outline-variant">
                    Regulated E-Waste
                  </span>
                </div>
                <h3 className="text-headline-sm font-bold text-primary mb-1">Electronics & PCB</h3>
                <p className="text-body-sm text-on-surface-variant mb-4">R2-certified hazardous component dismantling and precious metal recovery.</p>
                <div className="space-y-3 pt-3 border-t border-outline-variant/40">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant">Reward Value:</span>
                    <span className="font-bold text-primary">20 pts / kg</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-label-sm mb-1 text-on-surface-variant">
                      <span>Conversion Efficiency</span>
                      <span className="font-semibold text-secondary">64%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '64%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REAL-TIME IMPACT CALCULATOR */}
        <section className="py-20 bg-background" id="impact-calc">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 md:p-12 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Controls (6 cols) */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/40 text-secondary text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-sm">calculate</span>
                    <span>REAL-TIME ESG CALCULATOR</span>
                  </div>
                  <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-primary tracking-tight">
                    Calculate Your Facility's Ecological Offset
                  </h2>
                  <p className="text-body-md text-on-surface-variant">
                    Adjust monthly waste volume to estimate landfill diversion percentages, greenhouse gas reductions, and EcoCredits redeemable by your organization.
                  </p>

                  <div className="pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-title-md font-bold text-primary" htmlFor="wasteSlider">Monthly Waste Generation</label>
                      <span className="text-title-md font-mono font-bold text-secondary bg-surface-container-low px-3 py-1 rounded-lg border border-outline-variant/60">
                        {wasteAmount} kg / mo
                      </span>
                    </div>
                    <input
                      id="wasteSlider"
                      type="range"
                      min="50"
                      max="3000"
                      step="50"
                      value={wasteAmount}
                      onChange={(e) => setWasteAmount(Number(e.target.value))}
                      className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-label-sm text-outline">
                      <span>50 kg (Household)</span>
                      <span>1,000 kg (Apartment)</span>
                      <span>3,000 kg (Campus / Office)</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-bright border border-outline-variant/60 flex items-center gap-4">
                    <span className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary shrink-0">
                      <span className="material-symbols-outlined">shield</span>
                    </span>
                    <p className="text-body-sm text-on-surface-variant">
                      All calculations align with standard <strong className="text-primary font-semibold">EPA WARM</strong> recycling conversion metrics for institutional waste.
                    </p>
                  </div>
                </div>

                {/* Results (6 cols) */}
                <div className="lg:col-span-6 bg-surface-bright rounded-2xl border border-outline-variant p-6 md:p-8 space-y-6">
                  <h3 className="text-headline-sm font-bold text-primary">Projected Monthly Environmental Yield</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant">
                      <span className="text-label-sm text-on-surface-variant uppercase font-medium">Landfill Diversion</span>
                      <div className="text-mono-metric font-mono-metric text-primary mt-1">{diversionKg} kg</div>
                      <span className="text-label-sm text-secondary font-semibold">85% Diverted Rate</span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant">
                      <span className="text-label-sm text-on-surface-variant uppercase font-medium">Carbon Abated</span>
                      <div className="text-mono-metric font-mono-metric text-secondary mt-1">{carbonMt} MT</div>
                      <span className="text-label-sm text-outline font-medium">Scope 3 CO2e</span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant">
                      <span className="text-label-sm text-on-surface-variant uppercase font-medium">Trees Equivalent</span>
                      <div className="text-mono-metric font-mono-metric text-primary mt-1">{treesCount} Trees</div>
                      <span className="text-label-sm text-secondary font-semibold">Preservation impact</span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant">
                      <span className="text-label-sm text-on-surface-variant uppercase font-medium">EcoCredits Earned</span>
                      <div className="text-mono-metric font-mono-metric text-primary mt-1">{ecoCredits} pts</div>
                      <span className="text-label-sm text-secondary font-semibold">~${marketplaceVal} Reward Value</span>
                    </div>
                  </div>

                  {/* Comparison Bars */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-body-sm">
                      <span className="text-on-surface-variant">Traditional Municipal Landfill</span>
                      <span className="font-semibold text-error">15% Diverted</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2.5">
                      <div className="bg-error h-2.5 rounded-full" style={{ width: '15%' }}></div>
                    </div>

                    <div className="flex justify-between text-body-sm pt-2">
                      <span className="text-on-surface-variant">EcoTrack Reverse Logistics</span>
                      <span className="font-semibold text-secondary">85% Diverted</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2.5">
                      <div className="bg-secondary h-2.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 bg-surface-container-lowest border-t border-outline-variant/60" id="about">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-primary text-label-sm font-semibold">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>PROVEN INSTITUTIONAL RESULTS</span>
              </div>
              <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-primary tracking-tight">
                Trusted by Campus Facilities, Housing Boards, & Investors
              </h2>
              <p className="text-body-lg text-on-surface-variant">
                Institutions converting waste disposal cost centers into verifiable circular ESG victories.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-surface-bright border border-outline-variant flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-secondary mb-4">
                    {'★★★★★'}
                  </div>
                  <p className="text-body-md text-on-surface italic mb-6">
                    "Deploying EcoTrack across our 42 campus dormitories reduced our municipal waste haulage fee by 38% in the first semester alone. The verifiable ESG reports make our green accreditations painless."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/60">
                  <div className="w-11 h-11 rounded-full bg-primary-container text-secondary-fixed flex items-center justify-center font-bold text-body-md">
                    DL
                  </div>
                  <div>
                    <h4 className="text-title-md font-bold text-primary leading-tight">Dr. Lena Vance</h4>
                    <p className="text-label-sm text-on-surface-variant">Campus Facilities Dean, Metro University</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-surface-bright border border-outline-variant flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-secondary mb-4">
                    {'★★★★★'}
                  </div>
                  <p className="text-body-md text-on-surface italic mb-6">
                    "Our 800-unit condominium tower had terrible contamination in dry recycle chutes. EcoTrack’s doorstep pickup slots and resident EcoCredits completely transformed tenant participation."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/60">
                  <div className="w-11 h-11 rounded-full bg-primary-container text-secondary-fixed flex items-center justify-center font-bold text-body-md">
                    RM
                  </div>
                  <div>
                    <h4 className="text-title-md font-bold text-primary leading-tight">Rajesh Mehta</h4>
                    <p className="text-label-sm text-on-surface-variant">RWA President, Emerald Heights Towers</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-surface-bright border border-outline-variant flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-secondary mb-4">
                    {'★★★★★'}
                  </div>
                  <p className="text-body-md text-on-surface italic mb-6">
                    "EcoTrack has cracked the hardest problem in municipal cleantech: high unit density logistics combined with secondary material monetization. Outstanding capital efficiency."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/60">
                  <div className="w-11 h-11 rounded-full bg-primary-container text-secondary-fixed flex items-center justify-center font-bold text-body-md">
                    SC
                  </div>
                  <div>
                    <h4 className="text-title-md font-bold text-primary leading-tight">Sarah Chen</h4>
                    <p className="text-label-sm text-on-surface-variant">General Partner, CleanVenture Capital</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section className="py-20 bg-background border-t border-outline-variant/60">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <div className="text-center mb-12 space-y-3">
              <span className="text-label-sm uppercase tracking-wider text-secondary font-bold">Answers & Clarity</span>
              <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-primary tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-body-md text-on-surface-variant">
                Everything you need to know about our scheduled pickups, segregation protocol, and collector verification.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-outline-variant rounded-xl bg-surface-container-lowest overflow-hidden transition-colors">
                  <button
                    className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-surface-bright transition-colors"
                    onClick={() => toggleFaq(i)}
                  >
                    <span className="text-title-md font-bold text-primary">{faq.q}</span>
                    <span className="material-symbols-outlined text-outline transition-transform duration-200" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none' }}>
                      expand_more
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 pt-1 text-body-md text-on-surface-variant border-t border-outline-variant/30 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-outline-variant bg-surface-container-lowest">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-6 max-w-7xl mx-auto gap-4">
          <div className="flex items-center gap-3">
            <span className="text-headline-sm font-bold text-primary">EcoTrack</span>
            <span className="text-body-sm text-on-surface-variant">
              © 2026 EcoTrack Technologies Inc. Precision Cleantech Logistics.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-body-sm text-on-surface-variant">
            <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
            <span className="hover:text-primary cursor-pointer">Terms of Service</span>
            <span className="hover:text-primary cursor-pointer">Compliance & Audits</span>
            <Link to="/login" className="text-primary font-semibold hover:underline">Portal Sign In →</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
