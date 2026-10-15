// frontend/src/pages/SchedulePickup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { pickupsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../utils/helpers';
import toast from 'react-hot-toast';

const STREAMS = [
  {
    id: 'wet_waste',
    category: 'organic',
    title: 'Wet / Organic Waste',
    desc: 'Kitchen scraps, raw food remains, coffee grounds, and garden biomass.',
    points: 10,
    hub: 'Bio-Digester Hub #2',
    icon: 'compost',
  },
  {
    id: 'dry_waste',
    category: 'paper',
    title: 'Dry / Paper & Cardboard',
    desc: 'Corrugated boxes, newspapers, shredded mail, and office stationery.',
    points: 8,
    hub: 'Kraft Pulp Facility',
    icon: 'description',
  },
  {
    id: 'plastic',
    category: 'plastic',
    title: 'Plastic Packaging',
    desc: 'PET bottles, HDPE containers, cleaned pouches & multilayer films.',
    points: 12,
    hub: 'Poly Polymer Plant',
    icon: 'local_drink',
  },
  {
    id: 'e_waste',
    category: 'ewaste',
    title: 'Electronic Waste',
    desc: 'Spent lithium batteries, circuit boards, peripheral cables, broken gadgets.',
    points: 25,
    hub: 'E-Hazard SafeVault',
    icon: 'memory',
  },
];

const TIME_SLOTS = [
  { id: 'morning', time: '09:00', label: 'Morning', window: '08:00 – 11:00 AM', icon: 'wb_sunny' },
  { id: 'afternoon', time: '14:00', label: 'Afternoon', window: '01:00 – 04:00 PM', icon: 'light_mode' },
  { id: 'evening', time: '18:00', label: 'Evening', window: '05:00 – 08:00 PM', icon: 'nights_stay' },
];

export default function SchedulePickup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Selected streams (multi-selection for UI, primary stream for DB)
  const [selectedStreams, setSelectedStreams] = useState(['wet_waste', 'dry_waste']);
  const [weightKg, setWeightKg] = useState(8.5);
  const [bagCount, setBagCount] = useState(3);
  
  // Date selection
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const [dateType, setDateType] = useState('tomorrow'); // 'today' | 'tomorrow' | 'custom'
  const [customDate, setCustomDate] = useState(tomorrowStr);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  
  // Address & Notes
  const [address, setAddress] = useState(user?.address || 'Flat 402, Block B, Green Glen Layout, Bellandur, Bengaluru - 560103');
  const [instructions, setInstructions] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  
  // States
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [createdPickup, setCreatedPickup] = useState(null);

  // Derived calculations
  const effectiveDate = dateType === 'today' ? todayStr : dateType === 'tomorrow' ? tomorrowStr : customDate;
  
  // Average points per kg across selected streams
  const activeStreams = STREAMS.filter(s => selectedStreams.includes(s.id));
  const avgRate = activeStreams.length > 0 
    ? activeStreams.reduce((acc, s) => acc + s.points, 0) / activeStreams.length 
    : 10;
  const estimatedPoints = Math.round(weightKg * avgRate);
  
  // Compartment volume (arbitrary 50kg max = 100%)
  const volumeAlloc = Math.min(Math.round((weightKg / 50) * 100), 100);

  function toggleStream(id) {
    if (selectedStreams.includes(id)) {
      if (selectedStreams.length === 1) {
        toast.error('Select at least one waste stream.');
        return;
      }
      setSelectedStreams(selectedStreams.filter(s => s !== id));
    } else {
      setSelectedStreams([...selectedStreams, id]);
    }
  }

  async function handleConfirm() {
    if (!address.trim()) {
      toast.error('Please specify a pickup address.');
      return;
    }
    if (selectedStreams.length === 0) {
      toast.error('Please select at least one waste category.');
      return;
    }

    setLoading(true);
    try {
      // Primary waste type for database compatibility
      const primaryWasteType = selectedStreams[0];
      const payload = {
        waste_type: primaryWasteType,
        quantity_kg: parseFloat(weightKg),
        pickup_address: address,
        pickup_date: effectiveDate,
        pickup_time: selectedSlot.time,
        instructions: `[Streams: ${selectedStreams.join(', ')}] [Bags: ${bagCount}] ${instructions}`.trim(),
      };

      const res = await pickupsAPI.create(payload);
      setCreatedPickup({
        ...res.data.pickup,
        otp: '4892',
        points: estimatedPoints,
        slotName: `${dateType === 'today' ? 'Today' : dateType === 'tomorrow' ? 'Tomorrow' : effectiveDate} • ${selectedSlot.window}`,
      });
      setShowModal(true);
      toast.success('Pickup request submitted successfully! 🚛');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl w-full mx-auto">
        {/* Page Title & Micro Context */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-label-sm font-label-sm text-secondary font-semibold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-sm">schedule_send</span>
            Doorstep Cleantech Dispatch
          </div>
          <h1 className="text-headline-lg font-headline-lg text-primary tracking-tight">Schedule Waste Consignment</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Precision waste sorting, doorstep verification, and auditable diversion tracking for residential &amp; commercial sites.
          </p>
        </div>

        {/* TWO-COLUMN WORKFLOW GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* MAIN INTERACTIVE FORM COLUMN (8 COLUMNS) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* STEP 1: SELECT WASTE STREAM */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-5">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary text-label-md font-title-md flex items-center justify-center">1</span>
                  <div>
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">Select Waste Stream</h2>
                    <p className="text-body-sm font-body-sm text-outline">Select all applicable segregated categories for this pickup.</p>
                  </div>
                </div>
                <span className="text-label-sm font-label-sm px-2.5 py-1 rounded bg-surface-container text-on-surface-variant">Multiple Selection</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="streamGrid">
                {STREAMS.map(stream => {
                  const isChecked = selectedStreams.includes(stream.id);
                  return (
                    <label
                      key={stream.id}
                      onClick={() => toggleStream(stream.id)}
                      className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col justify-between transition-all relative select-none ${
                        isChecked 
                          ? 'border-primary bg-secondary-container/10 shadow-sm' 
                          : 'border-outline-variant bg-surface-container-lowest hover:border-primary/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent label onClick
                        className="absolute top-4 right-4 h-4 w-4 rounded border-outline text-primary-container focus:ring-secondary pointer-events-none"
                      />
                      <div>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                          isChecked ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-primary'
                        }`}>
                          <span className="material-symbols-outlined text-2xl">{stream.icon}</span>
                        </div>
                        <div className="text-title-md font-title-md text-on-surface">{stream.title}</div>
                        <p className="text-body-sm font-body-sm text-on-surface-variant mt-1 leading-snug">
                          {stream.desc}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
                        <span className="text-label-sm font-label-sm text-secondary font-semibold">
                          {stream.points} EcoPoints / kg
                        </span>
                        <span className="text-label-sm font-label-sm text-outline">{stream.hub}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* STEP 2: ESTIMATED QUANTITY & BAG COUNT */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-5">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary text-label-md font-title-md flex items-center justify-center">2</span>
                  <div>
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">Estimated Quantity &amp; Volume</h2>
                    <p className="text-body-sm font-body-sm text-outline">Assists our dispatch route payload capacity planning.</p>
                  </div>
                </div>
                {/* Live EcoPoints Reward Pill */}
                <div className="flex items-center gap-2 bg-secondary-container/30 border border-secondary/30 px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-secondary text-base fill-1">stars</span>
                  <span className="text-label-md font-label-md text-primary font-bold">
                    You'll earn ~{estimatedPoints} EcoPoints!
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Slider Controller */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-label-md font-label-md text-on-surface" htmlFor="weightSlider">Consignment Weight (kg)</label>
                    <span className="text-headline-sm font-mono-metric text-primary">{weightKg.toFixed(1)} kg</span>
                  </div>
                  <input
                    id="weightSlider"
                    type="range"
                    min="1"
                    max="50"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                    className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-label-sm font-label-sm text-outline">
                    <span>1.0 kg (Light Bag)</span>
                    <span>25.0 kg</span>
                    <span>50.0 kg (Max Standard)</span>
                  </div>
                </div>

                {/* Bag Stepper Counter */}
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/60 flex items-center justify-between">
                  <div>
                    <div className="text-title-md font-title-md text-on-surface">Standard Segregated Bags</div>
                    <div className="text-body-sm font-body-sm text-outline">Standard 30L biodegradable sacks</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Decrease bags"
                      onClick={() => setBagCount(b => Math.max(1, b - 1))}
                      className="w-9 h-9 rounded-lg bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors font-bold"
                    >
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="text-headline-sm font-mono-metric text-primary w-6 text-center">{bagCount}</span>
                    <button
                      type="button"
                      aria-label="Increase bags"
                      onClick={() => setBagCount(b => Math.min(20, b + 1))}
                      className="w-9 h-9 rounded-lg bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors font-bold"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bin Capacity Segmented Gauge */}
              <div className="mt-6 pt-5 border-t border-outline-variant/60">
                <div className="flex justify-between text-label-sm font-label-sm mb-2">
                  <span className="text-on-surface-variant font-medium">Van Compartment Volume Utilization</span>
                  <span className="text-secondary font-bold">{volumeAlloc}% Allocated ({volumeAlloc < 40 ? 'Optimal' : volumeAlloc < 80 ? 'Moderate' : 'Heavy Load'})</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
                  <div className="bg-secondary h-full rounded-full transition-all duration-300" style={{ width: `${volumeAlloc}%` }}></div>
                </div>
              </div>
            </section>

            {/* STEP 3: LOCATION & ADDRESS SELECTION */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-5">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary text-label-md font-title-md flex items-center justify-center">3</span>
                  <div>
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">Location &amp; Address Verification</h2>
                    <p className="text-body-sm font-body-sm text-outline">Collector dispatch route will be locked to this verified geolocation.</p>
                  </div>
                </div>
                <span className="text-label-sm font-label-sm px-2.5 py-1 rounded bg-secondary-container/20 text-secondary border border-secondary/30 flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-xs">verified</span> GPS Lock
                </span>
              </div>

              {/* Saved Address Radio Card */}
              <div className="space-y-4">
                <div className="border-2 border-primary bg-secondary-container/10 rounded-xl p-4 relative transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 w-full">
                      <span className="material-symbols-outlined text-primary text-xl mt-1">home</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-title-md font-title-md text-on-surface">Primary Residence / Pickup Point</span>
                          <span className="text-label-sm font-label-sm px-2 py-0.5 rounded bg-primary-container text-on-primary font-medium">Active</span>
                        </div>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Enter pickup address, flat no, landmark..."
                          className="mt-2 w-full text-body-md font-body-md p-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary/30"
                        />
                        <div className="flex flex-wrap items-center gap-4 text-label-sm font-label-sm text-outline mt-2">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">pin_drop</span> Lat: 12.9260° N, 77.6762° E
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">call</span> {user?.phone || '+91 98451 22091'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-secondary ml-2 fill-1">check_circle</span>
                  </div>
                </div>

                {/* Map Pin Preview Widget */}
                <div className="relative rounded-xl overflow-hidden border border-outline-variant bg-surface-container h-44 flex items-center justify-center">
                  <img
                    className="w-full h-full object-cover"
                    alt="GIS satellite map overview of Bellandur Bengaluru showing precision route vectors and a glowing emerald geofence pin."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzPrp8OMGhnC497m8dV5rDp99IVE6dFIz_wWCRzUOhLMqAuAqhjXwct-vl2FBMrFjyTnue_zMLfN5uLPCWShdlZJ23civ4JSsF_Vwl73pnMZX5QZrYLdAV0mSO2z6hHhObU87UDHEys_QLl7xonR-omjPh8qJac7sVBNen7wMiuoB4gIzoZSHZzfsnBOAxm5SKu0dnzUqqK22HYX50dMcP_OD86f-jXqDllVmqF_WJpJKiLIb05jMh"
                  />
                  <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline shadow-md flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-xl animate-bounce fill-1">location_on</span>
                      <div className="text-left">
                        <div className="text-label-sm font-label-sm text-primary font-bold">Collector Navigation Geotag</div>
                        <div className="text-label-sm font-label-sm text-outline">Green Glen Corridor • Bellandur Sector 4</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* STEP 4: SCHEDULE DATE & TIME SLOT */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-5">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary text-label-md font-title-md flex items-center justify-center">4</span>
                  <div>
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">Schedule Date &amp; Time Slot</h2>
                    <p className="text-body-sm font-body-sm text-outline">Zero-emission electric cargo vans operate across three daily windows.</p>
                  </div>
                </div>
                <span className="text-label-sm font-label-sm text-secondary font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span> 8 Slots Available
                </span>
              </div>

              {/* Date Selector Chips */}
              <div className="mb-5">
                <label className="text-label-md font-label-md text-on-surface block mb-2">Service Day</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDateType('today')}
                    className={`py-3 px-4 rounded-xl text-center transition-all ${
                      dateType === 'today'
                        ? 'border-2 border-primary bg-secondary-container/20 font-title-md text-primary shadow-sm'
                        : 'border border-outline-variant bg-surface-container-lowest font-body-md text-on-surface hover:border-primary'
                    }`}
                  >
                    <div className="text-label-sm font-label-sm text-secondary font-medium">Today</div>
                    <div className="text-title-md font-title-md">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDateType('tomorrow')}
                    className={`py-3 px-4 rounded-xl text-center transition-all ${
                      dateType === 'tomorrow'
                        ? 'border-2 border-primary bg-secondary-container/20 font-title-md text-primary shadow-sm'
                        : 'border border-outline-variant bg-surface-container-lowest font-body-md text-on-surface hover:border-primary'
                    }`}
                  >
                    <div className="text-label-sm font-label-sm text-outline">Tomorrow</div>
                    <div className="text-title-md font-title-md">{tomorrow.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDateType('custom')}
                    className={`py-3 px-4 rounded-xl text-center transition-all flex flex-col items-center justify-center ${
                      dateType === 'custom'
                        ? 'border-2 border-primary bg-secondary-container/20 font-title-md text-primary shadow-sm'
                        : 'border border-outline-variant bg-surface-container-lowest font-body-md text-on-surface hover:border-primary'
                    }`}
                  >
                    <div className="text-label-sm font-label-sm text-outline">Pick Custom</div>
                    <div className="text-title-md font-title-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_month</span> Custom Date
                    </div>
                  </button>
                </div>

                {dateType === 'custom' && (
                  <div className="mt-3">
                    <input
                      type="date"
                      min={todayStr}
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md"
                    />
                  </div>
                )}
              </div>

              {/* Time Slots */}
              <div>
                <label className="text-label-md font-label-md text-on-surface block mb-2">Dispatch Window</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {TIME_SLOTS.map(slot => {
                    const isSelected = selectedSlot.id === slot.id;
                    return (
                      <label
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`cursor-pointer rounded-xl p-3.5 flex items-center justify-between transition-all select-none ${
                          isSelected
                            ? 'border-2 border-primary bg-secondary-container/20 shadow-sm'
                            : 'border border-outline-variant hover:border-primary bg-surface-container-lowest'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="timeSlot"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 border-outline text-primary-container focus:ring-secondary pointer-events-none"
                          />
                          <div>
                            <div className="text-title-md font-title-md text-on-surface">{slot.label}</div>
                            <div className="text-label-sm font-label-sm text-on-surface-variant">{slot.window}</div>
                          </div>
                        </div>
                        <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-primary' : 'text-outline'}`}>
                          {slot.icon}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* STEP 5: SPECIAL HANDLING & AUDIT PHOTO */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-5">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary text-label-md font-title-md flex items-center justify-center">5</span>
                  <div>
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">Handling Directives &amp; Audit Photo</h2>
                    <p className="text-body-sm font-body-sm text-outline">Optional prep details to accelerate field weighing &amp; sorting.</p>
                  </div>
                </div>
                <span className="text-label-sm font-label-sm text-outline">Optional Step</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-label-md font-label-md text-on-surface block mb-1.5" htmlFor="instructions">
                    Special Handling Notes
                  </label>
                  <textarea
                    id="instructions"
                    rows="2"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Cardboard boxes are flattened and tied; wet waste in compostable liners on porch."
                    className="w-full rounded-lg border-outline-variant text-body-md font-body-md p-3 focus:border-secondary focus:ring-2 focus:ring-secondary/20 placeholder:text-outline/70"
                  ></textarea>
                </div>

                <div>
                  <label className="text-label-md font-label-md text-on-surface block mb-1.5">
                    Pre-Sort Photo Verification (AI Segregation Audit)
                  </label>
                  <div
                    onClick={() => {
                      setPhotoUploaded(!photoUploaded);
                      if (!photoUploaded) toast.success('Pre-sort photo attached! AI Segregation verified.');
                    }}
                    className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                      photoUploaded
                        ? 'border-secondary bg-secondary-container/15'
                        : 'border-outline-variant hover:border-secondary bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl text-secondary mb-2">
                      {photoUploaded ? 'check_circle' : 'add_a_photo'}
                    </span>
                    <div className="text-title-md font-title-md text-primary">
                      {photoUploaded ? 'Photo Attached: segregation_audit_01.jpg' : 'Upload Segregated Bag Photograph'}
                    </div>
                    <p className="text-body-sm font-body-sm text-outline mt-0.5">
                      {photoUploaded ? 'Auto-qualifies for fast verification track' : 'PNG, JPG or HEIC up to 10MB • Auto-qualifies for fast verification track'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* STICKY SUMMARY SIDEBAR (4 COLUMNS) */}
          <aside className="lg:col-span-4 sticky top-20">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                <div>
                  <h3 className="text-headline-sm font-headline-sm text-primary">Consignment Summary</h3>
                  <span className="text-label-sm font-label-sm text-outline">Order Draft #REQ-{Math.floor(1000 + Math.random() * 9000)}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-label-sm font-label-sm bg-secondary-container text-on-secondary-container font-semibold">
                  Ready
                </span>
              </div>

              {/* Breakdown Matrix */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-body-md font-body-md">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-secondary">category</span>
                    Streams Selected
                  </span>
                  <span className="text-on-surface font-title-md">{selectedStreams.length} Stream{selectedStreams.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Stream Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeStreams.map(s => (
                    <span key={s.id} className="px-2 py-1 rounded-md text-label-sm font-label-sm bg-surface-container text-primary font-medium">
                      {s.title.split('/')[0].trim()}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-body-md font-body-md pt-2 border-t border-outline-variant/60">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-secondary">scale</span>
                    Total Estimated Weight
                  </span>
                  <span className="text-on-surface font-title-md">{weightKg.toFixed(1)} kg</span>
                </div>

                <div className="flex justify-between items-center text-body-md font-body-md">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-secondary">shopping_bag</span>
                    Bag Units
                  </span>
                  <span className="text-on-surface font-title-md">{bagCount} Bags</span>
                </div>

                <div className="flex justify-between items-center text-body-md font-body-md">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-secondary">schedule</span>
                    Scheduled Slot
                  </span>
                  <span className="text-on-surface font-title-md">
                    {dateType === 'today' ? 'Today' : dateType === 'tomorrow' ? 'Tomorrow' : effectiveDate}, {selectedSlot.label}
                  </span>
                </div>

                <div className="flex justify-between items-start text-body-md font-body-md pt-2 border-t border-outline-variant/60">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-secondary">domain</span>
                    Assigned Partner Hub
                  </span>
                  <div className="text-right">
                    <div className="text-label-md font-title-md text-primary">Apex CleanTech Hub #4</div>
                    <div className="text-label-sm font-label-sm text-outline">Bellandur North Ward</div>
                  </div>
                </div>
              </div>

              {/* OTP Authentication Preview Box */}
              <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-label-sm font-label-sm text-on-surface-variant font-semibold">Collector Verification Code</span>
                  <span className="material-symbols-outlined text-base text-primary">lock</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-headline-sm font-mono-metric tracking-wider text-primary">OTP: 4892</div>
                  <span className="text-label-sm font-label-sm text-outline">Share at pickup door</span>
                </div>
              </div>

              {/* Reward Summary Highlight */}
              <div className="p-3.5 rounded-xl bg-secondary-container/20 border border-secondary/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined text-xl fill-1">workspace_premium</span>
                </div>
                <div>
                  <div className="text-title-md font-title-md text-primary">Estimated Reward: ~{estimatedPoints} Pts</div>
                  <div className="text-label-sm font-label-sm text-outline">Redeemable for utility credits</div>
                </div>
              </div>

              {/* Action Button: Trigger Confirmation */}
              <div className="space-y-2 pt-2">
                <button
                  id="btn-confirm-pickup"
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full bg-primary-container text-on-primary py-3 px-4 rounded-xl font-title-md text-title-md hover:bg-secondary active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-xl">verified</span>
                  {loading ? 'Submitting Request...' : 'Confirm & Schedule Pickup'}
                </button>
                <p className="text-center text-label-sm font-label-sm text-outline">
                  No cancellation fee up to 60 mins before slot start.
                </p>
              </div>
            </div>

            {/* Compliance & Traceability Micro-Badge */}
            <div className="mt-4 p-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-xl">security</span>
              <span className="text-label-sm font-label-sm text-on-surface-variant leading-tight">
                100% Traceable chain of custody audited under ISO 14001 Environmental Standard.
              </span>
            </div>
          </aside>
        </div>

        {/* SUCCESS MODAL PREVIEW */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-8 border border-outline-variant shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <button
                aria-label="Close modal"
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 text-outline hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>

              <div className="w-16 h-16 rounded-full bg-secondary-container/30 border border-secondary/40 text-secondary flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl fill-1">task_alt</span>
              </div>

              <div className="text-center mb-6">
                <span className="text-label-md font-label-md px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-semibold uppercase tracking-wider">
                  Consignment Confirmed
                </span>
                <h2 className="text-headline-lg font-headline-lg text-primary mt-2">Pickup Booked Successfully!</h2>
                <p className="text-body-md font-body-md text-on-surface-variant mt-1">
                  Your collection request has been assigned to Driver Ramesh (Vehicle #KA-03-ET-102).
                </p>
              </div>

              <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-label-md font-label-md text-outline">Tracking ID</span>
                  <span className="text-title-md font-mono-metric text-primary font-bold">#ET-{createdPickup?.id || '9021'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-label-md font-label-md text-outline">Time Slot</span>
                  <span className="text-body-md font-body-md text-on-surface font-medium">{createdPickup?.slotName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-label-md font-label-md text-outline">Doorstep Verification OTP</span>
                  <span className="text-headline-sm font-mono-metric text-secondary font-bold">{createdPickup?.otp || '4892'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-outline-variant/60">
                  <span className="text-label-md font-label-md text-outline">Credited On Inspection</span>
                  <span className="text-body-md font-body-md text-primary font-bold">~{createdPickup?.points || estimatedPoints} EcoPoints</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 px-4 rounded-lg border border-outline-variant text-on-surface font-title-md text-body-md hover:bg-surface-container transition-all cursor-pointer"
                >
                  Back to Portal
                </button>
                <button
                  onClick={() => navigate('/my-pickups')}
                  className="w-full py-2.5 px-4 rounded-lg bg-primary-container text-on-primary font-title-md text-body-md hover:bg-secondary transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">local_shipping</span>
                  View My Pickups
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
