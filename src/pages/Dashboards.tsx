import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { DataService, AuthService } from '../services';
import { formatINR } from '../utils/currency';
import { Pet, Booking, FeedingSchedule, Medication, Vaccination, Invoice, MedicalRecord } from '../types';
import {
  PawPrint,
  Home,
  Users2,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Pill,
  Syringe,
  FileText,
  Activity,
  PlusCircle,
  UtensilsCrossed,
  Check,
  CreditCard,
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  Users,
  Scissors,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, navigate } = useAuth();
  const pets = DataService.getPets();
  const bookings = DataService.getBookings();
  const invoices = DataService.getInvoices();
  const users = AuthService.getAllUsers();
  const telemetry = DataService.getTelemetry();
  const notifications = DataService.getNotifications();

  const totalRev = invoices.reduce((s, i) => s + (i.status === 'Paid' ? i.total : 0), 0);
  const pendingRev = invoices.reduce((s, i) => s + (i.status === 'Pending' ? i.total : 0), 0);
  const boarded = pets.filter((p) => p.isBoarded).length;
  const totalCapacity = 12; // 12 suites total
  const occupancyPct = Math.round((boarded / totalCapacity) * 100);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Hospital Administrator Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.name || 'Administrator'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Clinic operations are operating optimally. View patient intake, boarding occupancy, and staff roster.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/pets')}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <PawPrint className="w-4 h-4" /> Manage Patients
            </button>
            <button
              onClick={() => navigate('/users')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition backdrop-blur-xs flex items-center gap-1.5"
            >
              <Users2 className="w-4 h-4" /> Staff & Access
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Patients</span>
            <PawPrint className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1.5">{pets.length}</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-0.5 flex items-center gap-1">
            <span>{boarded} actively boarded</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Resort Occupancy</span>
            <Home className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1.5">{occupancyPct}%</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            {boarded} of {totalCapacity} luxury suites occupied
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Collected Revenue</span>
            <span className="text-emerald-600 font-bold text-sm">₹ INR</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1.5">{formatINR(totalRev)}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-0.5">
            {formatINR(pendingRev)} in pending billing
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Authorized Users</span>
            <Users2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-1.5">{users.length}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">Across 4 security roles</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Boarding Guests */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-800">Current Boarding Guests</h2>
              <p className="text-[11px] text-slate-400">Active resort suites and check-out schedule.</p>
            </div>
            <button
              onClick={() => navigate('/boarding')}
              className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-2.5">Guest & Owner</th>
                  <th className="pb-2.5">Assigned Suite</th>
                  <th className="pb-2.5">Stay Dates</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Daily Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="py-3">
                      <div className="font-bold text-slate-800">{b.petName}</div>
                      <div className="text-[10px] text-slate-400">{b.ownerName}</div>
                    </td>
                    <td className="py-3">
                      <span className="font-mono text-slate-700 font-semibold">{b.roomNumber}</span>
                      <span className="text-[10px] text-slate-400 block">{b.roomType}</span>
                    </td>
                    <td className="py-3 text-slate-600">
                      <div>{b.checkInDate}</div>
                      <div className="text-[10px] text-slate-400">until {b.checkOutDate}</div>
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-700">{formatINR(b.dailyRate)}/nt</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Telemetry Widget */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-800">Live Biometrics Glance</h2>
              <p className="text-[11px] text-slate-400">Simulated IoT telemetry</p>
            </div>
            <button
              onClick={() => navigate('/smart-monitor')}
              className="text-xs text-teal-600 hover:text-teal-700 font-bold"
            >
              Monitor
            </button>
          </div>

          <div className="space-y-3">
            {telemetry.map((t) => (
              <div
                key={t.petId}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs space-y-2 hover:bg-teal-50/30 transition"
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-800">{t.petName}</span>
                  <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200 font-mono">
                    {t.roomNumber}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">Pulse</span>
                    <span className="font-bold text-slate-800">{t.heartRate} bpm</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">Temp</span>
                    <span className="font-bold text-slate-800">{t.bodyTemp}°C</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">State</span>
                    <span className="font-bold text-slate-800">{t.activityLevel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>Telemetry readings simulate connected physiological collar sensors and climate sensors.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DoctorDashboard: React.FC = () => {
  const { user, navigate } = useAuth();
  const pets = DataService.getPets();
  const meds = DataService.getMedications();
  const records = DataService.getMedicalRecords();
  const vacs = DataService.getVaccinations();

  const dueVacs = vacs.filter((v) => v.status === 'Due Soon' || v.status === 'Overdue');

  return (
    <div className="space-y-6">
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-900/60">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span>Veterinary Clinical Station</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Dr. Marcus Vance, DVM ({user?.name || 'Veterinarian'})
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Manage clinical diagnostics, vital signs, prescriptions, and mandatory immunization schedules.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/records')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" /> Medical Records
            </button>
            <button
              onClick={() => navigate('/medications')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition backdrop-blur-xs flex items-center gap-1.5"
            >
              <Pill className="w-4 h-4" /> Prescriptions
            </button>
          </div>
        </div>
      </div>

      {/* Immunization Alerts */}
      {dueVacs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold block">
                {dueVacs.length} Immunization Boosters Require Attention
              </span>
              <span className="text-[11px] text-amber-700">
                Patients with vaccinations marked Due Soon or Overdue need clinical booster scheduling.
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/vaccinations')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shrink-0"
          >
            Review Vaccines
          </button>
        </div>
      )}

      {/* Main Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medical Diagnoses */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-800">Recent Patient Examinations</h2>
              <p className="text-[11px] text-slate-400">Clinical diagnostics, vitals, and treatment plans.</p>
            </div>
            <button
              onClick={() => navigate('/records')}
              className="text-xs text-teal-600 hover:text-teal-700 font-bold"
            >
              Add Record
            </button>
          </div>

          <div className="space-y-3">
            {records.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs space-y-2 hover:bg-emerald-50/20 transition"
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-900 text-sm">{r.petName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{r.date}</span>
                </div>
                <div className="text-teal-800 font-bold">{r.diagnosis}</div>
                <p className="text-slate-600 text-[11px]">{r.treatmentPlan}</p>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 flex flex-wrap gap-4 text-slate-600 text-[10px]">
                  <span>Temp: <strong>{r.vitals.temperature}°C</strong></span>
                  <span>Heart Rate: <strong>{r.vitals.heartRate} bpm</strong></span>
                  <span>Resp: <strong>{r.vitals.respiratoryRate}/min</strong></span>
                  <span>Weight: <strong>{r.vitals.weight} kg</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Prescriptions */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-800">Active Prescriptions & Dosages</h2>
              <p className="text-[11px] text-slate-400">Veterinary medications in current rotation.</p>
            </div>
            <button
              onClick={() => navigate('/medications')}
              className="text-xs text-teal-600 hover:text-teal-700 font-bold"
            >
              Prescribe
            </button>
          </div>

          <div className="space-y-3">
            {meds.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{m.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-teal-50 text-teal-700 font-bold border border-teal-200">
                      {m.petName}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    {m.dosage} • {m.frequency} ({m.route})
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Instructions: {m.instructions}</div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.isGivenToday ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {m.isGivenToday ? 'Administered' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const StaffDashboard: React.FC = () => {
  const { user, navigate } = useAuth();
  const [feedings, setFeedings] = useState(() => DataService.getFeedings());
  const [meds, setMeds] = useState(() => DataService.getMedications());
  const groomings = DataService.getGroomings();
  const bookings = DataService.getBookings();

  const handleToggleFeed = (id: string) => {
    DataService.toggleFeedingCompleted(id, user?.name || 'Staff Member', user?.role);
    setFeedings(DataService.getFeedings());
  };

  const handleToggleMed = (id: string) => {
    DataService.toggleMedicationGiven(id, user?.role);
    setMeds(DataService.getMedications());
  };

  return (
    <div className="space-y-6">
      {/* Staff Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-900/60">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-2">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Care & Boarding Operations Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {user?.name || 'Elena Rostova'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Daily patient care checklists: execute scheduled meals, administer daily medications, and manage grooming.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/feeding')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-4 h-4" /> Feeding Schedule
            </button>
            <button
              onClick={() => navigate('/grooming')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition backdrop-blur-xs flex items-center gap-1.5"
            >
              <Scissors className="w-4 h-4" /> Grooming Appointments
            </button>
          </div>
        </div>
      </div>

      {/* Quick Task Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Feeding Rounds */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-800">Today's Feeding Rounds</h2>
              <p className="text-[11px] text-slate-400">Click to record meal administration.</p>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {feedings.filter((f) => f.isCompleted).length} / {feedings.length} completed
            </span>
          </div>

          <div className="space-y-3">
            {feedings.map((f) => (
              <div
                key={f.id}
                className="p-3.5 rounded-2xl border border-slate-200/80 flex justify-between items-center text-xs hover:bg-slate-50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{f.petName}</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {f.mealType} ({f.scheduledTime})
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    {f.foodBrand} • <strong>{f.portionGrams}g</strong>
                  </div>
                  {f.dietaryRestrictions && (
                    <div className="text-rose-600 font-semibold text-[10px] mt-0.5">
                      ⚠️ {f.dietaryRestrictions}
                    </div>
                  )}
                  {f.isCompleted && f.completedAt && (
                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                      Served at {f.completedAt} by {f.staffName || 'Staff'}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleFeed(f.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition shadow-2xs ${
                    f.isCompleted
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {f.isCompleted ? 'Served ✓' : 'Serve Meal'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Medication Administration */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-800">Medication Delivery Tasks</h2>
              <p className="text-[11px] text-slate-400">Administer and record scheduled dosages.</p>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {meds.filter((m) => m.isGivenToday).length} / {meds.length} administered
            </span>
          </div>

          <div className="space-y-3">
            {meds.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl border border-slate-200/80 flex justify-between items-center text-xs hover:bg-slate-50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{m.name}</span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {m.petName}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    {m.dosage} • {m.frequency} ({m.route})
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{m.instructions}</div>
                  {m.isGivenToday && m.lastAdministered && (
                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                      Administered: {m.lastAdministered}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleMed(m.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition shadow-2xs ${
                    m.isGivenToday
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {m.isGivenToday ? 'Given ✓' : 'Give Dose'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const OwnerDashboard: React.FC = () => {
  const { user, navigate } = useAuth();
  const myPets = DataService.getPets(user);
  const myPetIds = myPets.map((p) => p.id);
  const bookings = DataService.getBookings(user);
  const telemetry = DataService.getTelemetry(user);
  const feedings = DataService.getFeedings(user);
  const medications = DataService.getMedications(user);
  const vaccinations = DataService.getVaccinations(user);
  const invoices = DataService.getInvoices(user);

  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [payMethod, setPayMethod] = useState<'Credit Card' | 'Cash' | 'Online Transfer'>('Credit Card');
  const [paySuccess, setPaySuccess] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    setPayError(null);
    try {
      DataService.markInvoicePaid(payingInvoice.id, payMethod, user);
      setPaySuccess(true);
      setTimeout(() => {
        setPaySuccess(false);
        setPayingInvoice(null);
      }, 1500);
    } catch (err: any) {
      setPayError(err.message || 'Payment processing failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Pet Parent Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-amber-900/60">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
              <HeartPulse className="w-3.5 h-3.5 text-amber-400" />
              <span>Pet Parent Sanctuary Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {user?.name || 'Pet Parent'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Stay connected with your beloved pets. Track real-time biometrics, room climate, daily diet, and medical records.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/smart-monitor')}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" /> Live Suite Camera
            </button>
            <button
              onClick={() => navigate('/pets')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition backdrop-blur-xs flex items-center gap-1.5"
            >
              <PawPrint className="w-4 h-4" /> My Registered Pets
            </button>
          </div>
        </div>
      </div>

      {/* Newly Registered Owner - Zero Pets Empty State Prompt */}
      {myPets.length === 0 && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-3xl p-6 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mx-auto">
            <PawPrint className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Welcome! You haven't added any pets yet</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
              Your pet parent account starts with a clean slate. Register your first pet to access personalized suite telemetry, meal schedules, and veterinary care tracking.
            </p>
          </div>
          <button
            onClick={() => navigate('/pets')}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition inline-flex items-center gap-1.5"
          >
            <PawPrint className="w-4 h-4" /> Register Your First Pet
          </button>
        </div>
      )}

      {/* Owner Restriction Notice Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900">Protected Care Access:</strong> You have real-time visibility into your
          pets' feeding schedules, medication logs, and boarding status. To ensure animal safety, medication administration
          and boarding status changes are exclusively managed by certified Veterinary and Care Staff.
        </div>
      </div>

      {/* Pets and Biometrics Glance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Live Biometrics */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-800">My Boarded Pets Telemetry</h2>
              <p className="text-[11px] text-slate-400">Continuous biometrics and suite environment.</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 animate-pulse">
              LIVE
            </span>
          </div>

          {telemetry.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              None of your registered pets are currently boarded at the resort.
            </div>
          ) : (
            <div className="space-y-3">
              {telemetry.map((t) => (
                <div key={t.petId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-sm text-slate-900">{t.petName}</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 font-mono">
                      {t.roomNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">Pulse</span>
                      <span className="font-bold text-slate-800 text-sm">{t.heartRate} bpm</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">Body Temp</span>
                      <span className="font-bold text-slate-800 text-sm">{t.bodyTemp}°C</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">Activity</span>
                      <span className="font-bold text-emerald-700 text-sm">{t.activityLevel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoices & Stays */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-800">Invoices & Billing</h2>
              <p className="text-[11px] text-slate-400">Review itemized invoices and settle balances.</p>
            </div>
            <button
              onClick={() => navigate('/invoices')}
              className="text-xs text-teal-600 hover:text-teal-700 font-bold"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No invoices on file.</div>
            ) : (
              invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-2xl border border-slate-200/80 flex justify-between items-center text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{inv.invoiceNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-1">
                      {inv.petName} • Due: {inv.dueDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-slate-900">{formatINR(inv.total)}</span>
                    {inv.status !== 'Paid' && (
                      <button
                        onClick={() => setPayingInvoice(inv)}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-2xs"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Read-Only Care Overview: Feeding & Medications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-800">Diet & Meal Schedules</h2>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Read-Only
            </span>
          </div>
          <div className="space-y-2.5 text-xs">
            {feedings.length === 0 ? (
              <div className="text-slate-400 py-4 text-center">No active meal schedules for your pets.</div>
            ) : (
              feedings.map((f) => (
                <div key={f.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800">{f.petName}</span> ({f.mealType} at {f.scheduledTime})
                    <div className="text-slate-500 text-[11px]">{f.foodBrand} • {f.portionGrams}g</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      f.isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {f.isCompleted ? 'Served ✓' : 'Scheduled'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-800">Prescription Medications</h2>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Read-Only
            </span>
          </div>
          <div className="space-y-2.5 text-xs">
            {medications.length === 0 ? (
              <div className="text-slate-400 py-4 text-center">No active medications registered.</div>
            ) : (
              medications.map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800">{m.name}</span> ({m.petName})
                    <div className="text-slate-500 text-[11px]">{m.dosage} • {m.frequency}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.isGivenToday ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {m.isGivenToday ? 'Given Today ✓' : 'Pending Round'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Settle Invoice</h3>
              <button onClick={() => setPayingInvoice(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {paySuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-slate-800">Payment Successful!</h4>
                <p className="text-xs text-slate-500">
                  Invoice {payingInvoice.invoiceNumber} has been balanced.
                </p>
              </div>
            ) : (
              <form onSubmit={handleExecutePayment} className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invoice:</span>
                    <span className="font-mono font-bold">{payingInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient:</span>
                    <span className="font-bold">{payingInvoice.petName}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                    <span className="font-bold">Total Due:</span>
                    <span className="font-black text-emerald-600">{formatINR(payingInvoice.total)}</span>
                  </div>
                </div>

                {payError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-[11px] text-rose-700 rounded-xl font-medium">
                    {payError}
                  </div>
                )}

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                  <strong>Demo Notice:</strong> Simulated payment gateway for evaluation and testing purposes.
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Payment Method
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Credit Card">Credit Card (Simulated)</option>
                    <option value="Online Transfer">UPI / Online Transfer</option>
                    <option value="Cash">Cash at Counter</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  Confirm & Pay {formatINR(payingInvoice.total)}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
