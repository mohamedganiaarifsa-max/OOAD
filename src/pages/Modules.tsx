import React, { useState } from 'react';
import { DataService, AuthService } from '../services';
import { formatINR } from '../utils/currency';
import { useAuth } from '../AuthContext';
import {
  Pet,
  Booking,
  FeedingSchedule,
  Medication,
  Vaccination,
  GroomingAppointment,
  MedicalRecord,
  Invoice,
  NotificationItem,
  User,
  UserRole,
} from '../types';
import {
  PawPrint,
  Plus,
  Trash2,
  Eye,
  X,
  Search,
  Filter,
  Home,
  UtensilsCrossed,
  Check,
  Pill,
  Syringe,
  Scissors,
  FileText,
  Activity,
  CreditCard,
  BarChart3,
  Users2,
  Bell,
  HeartPulse,
  RotateCcw,
  AlertTriangle,
  Clock,
  Sparkles,
  Camera,
  CheckCircle2,
  Receipt,
  FileCheck,
  Shield,
  Stethoscope,
  Info,
  Calendar,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { exportPetExcelReport, exportAllPetsExcelReport, exportModularExcelReport } from '../utils/excelExport';

// ==========================================
// 1. PET MANAGEMENT MODULE
// ==========================================
export const PetManagement: React.FC = () => {
  const { user, role } = useAuth();
  const [pets, setPets] = useState(() => DataService.getPets(user));
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('All');
  const [boardedFilter, setBoardedFilter] = useState<string>('All');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Pet['species']>('Dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState(2);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [weight, setWeight] = useState(12.5);
  const [ownerName, setOwnerName] = useState(user?.role === 'owner' ? user.name : '');
  const [ownerPhone, setOwnerPhone] = useState(user?.role === 'owner' ? user.phone || '' : '');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  const filteredPets = pets.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.breed.toLowerCase().includes(search.toLowerCase()) ||
      p.microchipId.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase());
    const matchesSpecies = speciesFilter === 'All' || p.species === speciesFilter;
    const matchesBoarded =
      boardedFilter === 'All' ||
      (boardedFilter === 'Boarded' && p.isBoarded) ||
      (boardedFilter === 'At Home' && !p.isBoarded);
    return matchesSearch && matchesSpecies && matchesBoarded;
  });

  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    const allergiesList = allergiesInput
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const defaultAvatars: Record<Pet['species'], string> = {
      Dog: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300',
      Cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300',
      Bird: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=300',
      Rabbit: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300',
      Other: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=300',
    };

    DataService.addPet(
      {
        name,
        species,
        breed,
        age: Number(age),
        gender,
        weight: Number(weight),
        ownerId: user?.id || 'usr_owner_01',
        ownerName: user?.role === 'owner' ? user.name : ownerName || 'Pet Owner',
        ownerPhone: user?.role === 'owner' ? user.phone || '' : ownerPhone || '+91 98765 43213',
        microchipId: `985-${Math.floor(1000 + Math.random() * 9000)}-${species[0].toUpperCase()}`,
        avatarUrl: defaultAvatars[species],
        allergies: allergiesList,
        medicalNotes: medicalNotes || undefined,
        isBoarded: false,
      },
      user
    );

    setPets(DataService.getPets(user));
    setShowAdd(false);
    // Reset inputs
    setName('');
    setBreed('');
    setAge(2);
    setWeight(12.5);
    setAllergiesInput('');
    setMedicalNotes('');
  };

  const handleDeletePet = (id: string, petName: string) => {
    if (window.confirm(`Are you sure you want to delete patient record for "${petName}"?`)) {
      try {
        DataService.deletePet(id, user);
        setPets(DataService.getPets(user));
        if (selectedPet?.id === id) setSelectedPet(null);
      } catch (err: any) {
        alert(err.message || 'Error deleting pet');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pet Directory & Profiles</h1>
          <p className="text-xs text-slate-500">Comprehensive patient records, species, microchips, and medical notes.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Register New Pet
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, breed, microchip, or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Species:</span>
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              <option value="All">All Species</option>
              <option value="Dog">Dogs</option>
              <option value="Cat">Cats</option>
              <option value="Bird">Birds</option>
              <option value="Rabbit">Rabbits</option>
              <option value="Other">Other Species</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Status:</span>
            <select
              value={boardedFilter}
              onChange={(e) => setBoardedFilter(e.target.value)}
              className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Boarded">Actively Boarded</option>
              <option value="At Home">At Home</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pet Card Grid */}
      {filteredPets.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <PawPrint className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-700">No pet records found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search criteria or register a new pet profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPets.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition p-4 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3">
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-sm text-slate-800 truncate">{p.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {p.gender}
                      </span>
                    </div>
                    <span className="text-xs text-teal-700 font-semibold block">{p.species} • {p.breed}</span>
                    <span className="text-[11px] text-slate-500 font-mono block">Chip: {p.microchipId}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>Age: <strong className="text-slate-800">{p.age} yrs</strong></div>
                  <div>Weight: <strong className="text-slate-800">{p.weight} kg</strong></div>
                  <div className="col-span-2 truncate">Owner: <strong className="text-slate-800">{p.ownerName}</strong></div>
                  <div className="col-span-2 text-slate-400 text-[10px] truncate">{p.ownerPhone}</div>
                </div>

                {p.allergies && p.allergies.length > 0 && (
                  <div className="mt-2 text-[10px] text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 truncate">
                    ⚠️ Allergies: {p.allergies.join(', ')}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                    p.isBoarded
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {p.isBoarded ? `Boarded (${p.roomNumber || 'Suite'})` : 'At Home'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedPet(p)}
                    className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-50 rounded-lg transition"
                    title="View Full Profile"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {user?.role !== 'owner' && (
                    <button
                      onClick={() => handleDeletePet(p.id, p.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Pet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pet Details Modal */}
      {selectedPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPet.avatarUrl}
                  alt={selectedPet.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-100"
                />
                <div>
                  <h3 className="font-black text-lg text-slate-800">{selectedPet.name}</h3>
                  <span className="text-xs text-teal-700 font-semibold">{selectedPet.species} • {selectedPet.breed}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPet(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Gender</span><strong className="text-slate-800">{selectedPet.gender}</strong></div>
                <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Age</span><strong className="text-slate-800">{selectedPet.age} Years</strong></div>
                <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Weight</span><strong className="text-slate-800">{selectedPet.weight} kg</strong></div>
                <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Microchip ID</span><strong className="font-mono text-slate-800">{selectedPet.microchipId}</strong></div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Owner Details</span>
                <div className="font-bold text-slate-800">{selectedPet.ownerName}</div>
                <div className="text-slate-600">{selectedPet.ownerPhone}</div>
              </div>

              {selectedPet.allergies && selectedPet.allergies.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900">
                  <span className="font-bold block mb-1">Identified Allergies:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {selectedPet.allergies.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPet.medicalNotes && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700">
                  <span className="font-bold block text-slate-800 mb-1">Clinical / Care Notes:</span>
                  <p>{selectedPet.medicalNotes}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedPet(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Pet Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-800">Register New Patient Profile</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPet} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Pet Name *</label>
                <input
                  required
                  placeholder="e.g., Milo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Species *</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Breed *</label>
                <input
                  required
                  placeholder="e.g., Labrador Retriever"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Owner Name *</label>
                  <input
                    required
                    placeholder="Owner Full Name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Owner Phone *</label>
                  <input
                    required
                    placeholder="+1 (555) 000-0000"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Allergies (comma separated)</label>
                <input
                  placeholder="e.g., Penicillin, Chicken, Beef"
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Medical / Care Notes</label>
                <textarea
                  rows={2}
                  placeholder="Special dietary guidelines, behavior, or pre-existing conditions..."
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Save Patient Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. BOOKING & BOARDING MODULE
// ==========================================
export const BookingBoarding: React.FC = () => {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState(() => DataService.getBookings(user));
  const pets = DataService.getPets(user);
  const [showAdd, setShowAdd] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // New booking form
  const [petId, setPetId] = useState(pets[0]?.id || '');
  const [roomType, setRoomType] = useState<Booking['roomType']>('Deluxe Suite');
  const [roomNumber, setRoomNumber] = useState('Suite 105');
  const [checkInDate, setCheckInDate] = useState('2026-11-05');
  const [checkOutDate, setCheckOutDate] = useState('2026-11-10');
  const [dailyRate, setDailyRate] = useState(2500);
  const [emergencyContact, setEmergencyContact] = useState('+91 98765 43219');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const isOwner = role === 'owner';

  const handleStatusChange = (id: string, newStatus: Booking['status']) => {
    try {
      DataService.updateBooking(id, { status: newStatus }, role || undefined, user);
      setBookings(DataService.getBookings(user));
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const selPet = pets.find((p) => p.id === petId) || pets[0];
    if (!selPet) {
      alert('Please register a pet before booking a suite stay.');
      return;
    }

    try {
      DataService.addBooking(
        {
          petId: selPet.id,
          petName: selPet.name,
          ownerId: selPet.ownerId,
          ownerName: selPet.ownerName,
          roomType,
          roomNumber,
          checkInDate,
          checkOutDate,
          status: 'Confirmed',
          dailyRate: Number(dailyRate),
          emergencyContact,
          specialInstructions: specialInstructions || undefined,
        },
        user
      );

      setBookings(DataService.getBookings(user));
      setShowAdd(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create booking.');
    }
  };

  const filteredBookings = bookings.filter(
    (b) => statusFilter === 'All' || b.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Booking & Resort Boarding</h1>
          <p className="text-xs text-slate-500">
            Luxury boarding suites, feline condos, check-in schedules, and room assignment.
          </p>
        </div>
        {!isOwner && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> New Boarding Reservation
          </button>
        )}
      </div>

      {/* Owner Restriction Notice */}
      {isOwner && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Read-Only Mode:</strong> As a Pet Owner, you have complete visibility over your pet’s stay dates,
            room assignments, and emergency details. Booking status modifications are managed by Care Staff.
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 w-fit text-xs">
        <span className="font-bold text-slate-400 uppercase text-[10px]">Filter Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium"
        >
          <option value="All">All Reservations</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Checked-In">Checked-In</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200/80">
              <tr>
                <th className="p-4">Guest Patient</th>
                <th className="p-4">Room & Type</th>
                <th className="p-4">Check-In / Out</th>
                <th className="p-4">Daily Rate</th>
                <th className="p-4">Emergency Contact</th>
                <th className="p-4">Boarding Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{b.petName}</div>
                    <div className="text-[11px] text-slate-400">{b.ownerName}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono font-bold text-slate-800">{b.roomNumber}</span>
                    <span className="text-[10px] text-teal-700 block">{b.roomType}</span>
                  </td>
                  <td className="p-4 text-slate-600">
                    <div>{b.checkInDate}</div>
                    <div className="text-[10px] text-slate-400">to {b.checkOutDate}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{formatINR(b.dailyRate)}/night</td>
                  <td className="p-4 text-slate-500 font-mono text-[11px]">{b.emergencyContact}</td>
                  <td className="p-4">
                    {/* Owner cannot change status: show static badge */}
                    {isOwner ? (
                      <span
                        className={`px-3 py-1 rounded-full font-bold text-[10px] inline-block border ${
                          b.status === 'Checked-In'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : b.status === 'Confirmed'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : b.status === 'Completed'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    ) : (
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value as any)}
                        className={`p-1.5 rounded-xl font-bold text-[11px] border focus:outline-none ${
                          b.status === 'Checked-In'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : b.status === 'Confirmed'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : b.status === 'Completed'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Checked-In">Checked-In</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Booking Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-800">New Resort Reservation</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBooking} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Select Guest Patient *</label>
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species} - {p.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Suite Type *</label>
                  <select
                    value={roomType}
                    onChange={(e) => {
                      const rt = e.target.value as Booking['roomType'];
                      setRoomType(rt);
                      if (rt === 'Standard Kennel') setDailyRate(950);
                      if (rt === 'Cat Condo') setDailyRate(1500);
                      if (rt === 'Deluxe Suite') setDailyRate(2500);
                      if (rt === 'VIP Penthouse') setDailyRate(4000);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Standard Kennel">Standard Kennel (₹950/nt)</option>
                    <option value="Cat Condo">Cat Condo (₹1,500/nt)</option>
                    <option value="Deluxe Suite">Deluxe Suite (₹2,500/nt)</option>
                    <option value="VIP Penthouse">VIP Penthouse (₹4,000/nt)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Room Assignment *</label>
                  <input
                    required
                    placeholder="e.g., Suite 108"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Check-In Date *</label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Check-Out Date *</label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Emergency Contact Phone *</label>
                <input
                  required
                  placeholder="+1 (555) 234-5678"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Special Care Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Daily brushing, calming diffuser, outdoor yard play times..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Confirm Reservation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. FEEDING SCHEDULE MANAGEMENT MODULE
// ==========================================
export const FeedingScheduleView: React.FC = () => {
  const { user, role } = useAuth();
  const [feedings, setFeedings] = useState(() => DataService.getFeedings(user));
  const pets = DataService.getPets(user);
  const [mealFilter, setMealFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [petId, setPetId] = useState(pets[0]?.id || '');
  const [mealType, setMealType] = useState<FeedingSchedule['mealType']>('Breakfast');
  const [scheduledTime, setScheduledTime] = useState('08:00 AM');
  const [foodBrand, setFoodBrand] = useState('Royal Canin Adult');
  const [portionGrams, setPortionGrams] = useState(250);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [notes, setNotes] = useState('');

  const isOwner = role === 'owner';

  const handleToggleServe = (id: string) => {
    try {
      DataService.toggleFeedingCompleted(id, user?.name || 'Staff Member', role || undefined);
      setFeedings(DataService.getFeedings(user));
    } catch (err: any) {
      alert(err.message || 'Permission denied');
    }
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const selPet = pets.find((p) => p.id === petId) || pets[0];
    if (!selPet) {
      alert('Please register a pet first.');
      return;
    }

    try {
      DataService.addFeeding(
        {
          petId: selPet.id,
          petName: selPet.name,
          mealType,
          scheduledTime,
          foodBrand,
          portionGrams: Number(portionGrams),
          dietaryRestrictions,
          isCompleted: false,
          notes: notes || undefined,
        },
        role || undefined
      );
      setFeedings(DataService.getFeedings(user));
      setShowAdd(false);
    } catch (err: any) {
      alert(err.message || 'Permission denied');
    }
  };

  const filteredFeedings = feedings.filter(
    (f) => mealFilter === 'All' || f.mealType === mealFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Diet & Feeding Schedules</h1>
          <p className="text-xs text-slate-500">
            Nutritional portions, allergy alerts, breakfast, lunch, dinner, and snack tracking.
          </p>
        </div>
        {!isOwner && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Meal Schedule
          </button>
        )}
      </div>

      {isOwner && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Read-Only Mode:</strong> Pet Parents can review scheduled meal times and portion metrics.
            Staff members mark meals as served upon kitchen delivery.
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 w-fit text-xs">
        <span className="font-bold text-slate-400 uppercase text-[10px]">Filter Meal:</span>
        <select
          value={mealFilter}
          onChange={(e) => setMealFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium"
        >
          <option value="All">All Meals</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Snack">Snack</option>
        </select>
      </div>

      {/* Grid of Meal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFeedings.map((f) => (
          <div
            key={f.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-slate-800">{f.petName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {f.mealType} • {f.scheduledTime}
                    </span>
                  </div>
                  <div className="text-slate-600 text-xs mt-1.5">
                    Brand: <strong>{f.foodBrand}</strong>
                  </div>
                  <div className="text-slate-600 text-xs">
                    Portion: <strong>{f.portionGrams} grams</strong>
                  </div>
                </div>

                {/* Status Indicator */}
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                    f.isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {f.isCompleted ? 'Served ✓' : 'Scheduled'}
                </span>
              </div>

              {f.dietaryRestrictions && (
                <div className="mt-2 text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200 text-xs font-semibold">
                  ⚠️ Restriction: {f.dietaryRestrictions}
                </div>
              )}

              {f.notes && (
                <div className="mt-2 text-slate-500 text-[11px] italic">
                  Note: "{f.notes}"
                </div>
              )}

              {f.isCompleted && f.completedAt && (
                <div className="mt-2 text-emerald-700 text-[10px] font-medium">
                  Completed at {f.completedAt} by {f.staffName || 'Care Staff'}
                </div>
              )}
            </div>

            {/* Serve Button - strictly disabled/hidden for Owner */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {isOwner ? 'Read-Only Parent Access' : 'Staff Action'}
              </span>

              {!isOwner && (
                <button
                  type="button"
                  onClick={() => handleToggleServe(f.id)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition shadow-2xs ${
                    f.isCompleted
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {f.isCompleted ? 'Mark Pending' : 'Serve Meal Now'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-800">Add Feeding Schedule</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Patient *</label>
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Meal *</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Scheduled Time *</label>
                  <input
                    required
                    placeholder="08:00 AM"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Food Formula / Brand *</label>
                  <input
                    required
                    placeholder="e.g. Royal Canin Adult"
                    value={foodBrand}
                    onChange={(e) => setFoodBrand(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Portion (Grams) *</label>
                  <input
                    type="number"
                    min={10}
                    required
                    value={portionGrams}
                    onChange={(e) => setPortionGrams(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Dietary Restrictions</label>
                <input
                  placeholder="e.g. No poultry byproducts, add fish oil"
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Special Feeding Notes</label>
                <input
                  placeholder="e.g. Use maze bowl to slow intake"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Create Feeding Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. MEDICATION MANAGEMENT MODULE
// ==========================================
export const MedicationManagement: React.FC = () => {
  const { user, role } = useAuth();
  const [meds, setMeds] = useState(() => DataService.getMedications(user));
  const pets = DataService.getPets(user);
  const [showAdd, setShowAdd] = useState(false);

  // Form
  const [petId, setPetId] = useState(pets[0]?.id || '');
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [route, setRoute] = useState<Medication['route']>('Oral');
  const [prescribedBy, setPrescribedBy] = useState('Dr. Marcus Vance, DVM');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-15');
  const [instructions, setInstructions] = useState('');

  const isOwner = role === 'owner';

  const handleToggleAdminister = (id: string) => {
    try {
      DataService.toggleMedicationGiven(id, role || undefined);
      setMeds(DataService.getMedications(user));
    } catch (err: any) {
      alert(err.message || 'Permission denied');
    }
  };

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    const selPet = pets.find((p) => p.id === petId) || pets[0];
    if (!selPet) {
      alert('Please register a pet first.');
      return;
    }

    try {
      DataService.addMedication(
        {
          petId: selPet.id,
          petName: selPet.name,
          name,
          dosage,
          frequency,
          route,
          prescribedBy,
          startDate,
          endDate,
          isGivenToday: false,
          instructions,
        },
        role || undefined
      );
      setMeds(DataService.getMedications(user));
      setShowAdd(false);
      setName('');
      setDosage('');
      setInstructions('');
    } catch (err: any) {
      alert(err.message || 'Permission denied');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Veterinary Prescription Medications</h1>
          <p className="text-xs text-slate-500">
            Dosages, administration routes (Oral, Topical, Injection, Eye Drops), and daily administration records.
          </p>
        </div>
        {!isOwner && (role === 'admin' || role === 'doctor') && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Prescribe Medication
          </button>
        )}
      </div>

      {isOwner && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Read-Only Mode:</strong> Pet Parents can track prescribed medications, dosages, and administration
            times. Only certified Medical & Care Staff can administer pharmaceuticals.
          </div>
        </div>
      )}

      {/* Medication Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meds.map((m) => (
          <div
            key={m.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-slate-800">{m.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {m.petName}
                    </span>
                  </div>
                  <div className="text-slate-600 text-xs mt-1.5 font-medium">
                    Dosage: <strong className="text-slate-900">{m.dosage}</strong> • {m.frequency}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Route: <span className="font-semibold text-slate-700">{m.route}</span> • Prescribed by {m.prescribedBy}
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                    m.isGivenToday
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {m.isGivenToday ? 'Given Today ✓' : 'Pending Round'}
                </span>
              </div>

              <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-700">
                <span className="font-bold text-slate-800 block text-[10px] uppercase">Instructions</span>
                {m.instructions}
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Course: {m.startDate} → {m.endDate}</span>
                {m.lastAdministered && <span>Last: {m.lastAdministered}</span>}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {isOwner ? 'Read-Only Parent Access' : 'Care Team Delivery'}
              </span>

              {!isOwner && (
                <button
                  type="button"
                  onClick={() => handleToggleAdminister(m.id)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition shadow-2xs ${
                    m.isGivenToday
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {m.isGivenToday ? 'Undo Dose' : 'Administer Dose'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-800">New Clinical Prescription</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMed} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Patient *</label>
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Medication Name *</label>
                <input
                  required
                  placeholder="e.g., Amoxicillin Clavulanate"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Dosage *</label>
                  <input
                    required
                    placeholder="e.g., 62.5 mg"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Route *</label>
                  <select
                    value={route}
                    onChange={(e) => setRoute(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Oral">Oral</option>
                    <option value="Topical">Topical</option>
                    <option value="Injection">Injection</option>
                    <option value="Eye Drops">Eye Drops</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Frequency *</label>
                <input
                  required
                  placeholder="e.g., Twice daily with morning and evening food"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Prescribing Doctor *</label>
                <input
                  required
                  value={prescribedBy}
                  onChange={(e) => setPrescribedBy(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Instructions *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Give with meal, shake well before use..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Issue Prescription
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. VACCINATION MANAGEMENT MODULE
// ==========================================
export const VaccinationManagement: React.FC = () => {
  const { user, role } = useAuth();
  const [vacs, setVacs] = useState(() => DataService.getVaccinations(user));
  const pets = DataService.getPets(user);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Vaccination | null>(null);

  // Form
  const [petId, setPetId] = useState(pets[0]?.id || '');
  const [vaccineName, setVaccineName] = useState('Rabies 3-Year Vaccine');
  const [dateAdministered, setDateAdministered] = useState('2026-11-01');
  const [dueDate, setDueDate] = useState('2029-11-01');
  const [batchNumber, setBatchNumber] = useState('VET-99014-RAB');
  const [administeredBy, setAdministeredBy] = useState('Dr. Marcus Vance, DVM');
  const [status, setStatus] = useState<Vaccination['status']>('Up to Date');

  const handleAddVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    const selPet = pets.find((p) => p.id === petId) || pets[0];
    if (!selPet) {
      alert('Please register a pet first.');
      return;
    }

    DataService.addVaccination({
      petId: selPet.id,
      petName: selPet.name,
      vaccineName,
      dateAdministered,
      dueDate,
      batchNumber,
      administeredBy,
      status,
      certificateId: `CERT-${Date.now().toString().slice(-6)}`,
    });

    setVacs(DataService.getVaccinations(user));
    setShowAdd(false);
  };

  const filteredVacs = vacs.filter((v) => statusFilter === 'All' || v.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Immunization & Vaccination Records</h1>
          <p className="text-xs text-slate-500">
            Rabies, DHPP, Bordetella, FVRCP tracking, batch numbers, and digital health certificates.
          </p>
        </div>
        {(role === 'admin' || role === 'doctor') && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Record Vaccination
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 w-fit text-xs">
        <span className="font-bold text-slate-400 uppercase text-[10px]">Filter Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium"
        >
          <option value="All">All Statuses</option>
          <option value="Up to Date">Up to Date</option>
          <option value="Due Soon">Due Soon</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Vaccination Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredVacs.map((v) => (
          <div
            key={v.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{v.petName}</h3>
                  <div className="text-xs font-black text-teal-800 mt-0.5">{v.vaccineName}</div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    v.status === 'Up to Date'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : v.status === 'Due Soon'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {v.status}
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div>Administered: <strong>{v.dateAdministered}</strong></div>
                <div>Next Booster Due: <strong className="text-slate-900">{v.dueDate}</strong></div>
                <div>Batch: <span className="font-mono text-slate-500">{v.batchNumber}</span></div>
                <div className="text-slate-400 text-[10px]">By: {v.administeredBy}</div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="font-mono text-[10px] text-slate-400">{v.certificateId}</span>
              <button
                onClick={() => setSelectedCert(v)}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <FileCheck className="w-3.5 h-3.5" /> Certificate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Digital Immunization Certificate
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">{selectedCert.vaccineName}</h3>
              <p className="text-xs text-teal-700 font-semibold">{selectedCert.petName}</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Certificate ID:</span>
                <span className="font-mono font-bold">{selectedCert.certificateId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Batch Number:</span>
                <span className="font-mono">{selectedCert.batchNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date Administered:</span>
                <span className="font-bold">{selectedCert.dateAdministered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Booster Due Date:</span>
                <span className="font-bold text-slate-900">{selectedCert.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Veterinarian:</span>
                <span className="font-semibold">{selectedCert.administeredBy}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-700">{selectedCert.status}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedCert(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
            >
              Done / Close Certificate
            </button>
          </div>
        </div>
      )}

      {/* Add Vaccine Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-800">Record Vaccine Administration</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVaccine} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Patient *</label>
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Vaccine Name *</label>
                <input
                  required
                  placeholder="e.g. Rabies 3-Year Vaccine"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Date Administered *</label>
                  <input
                    type="date"
                    required
                    value={dateAdministered}
                    onChange={(e) => setDateAdministered(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Booster Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Batch / Serial # *</label>
                  <input
                    required
                    placeholder="e.g. VET-88391-RAB"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Up to Date">Up to Date</option>
                    <option value="Due Soon">Due Soon</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Administered By *</label>
                <input
                  required
                  value={administeredBy}
                  onChange={(e) => setAdministeredBy(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Save Vaccine Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. GROOMING SALON MANAGEMENT MODULE
// ==========================================
export const GroomingManagement: React.FC = () => {
  const { user, role } = useAuth();
  const [groomings, setGroomings] = useState(() => DataService.getGroomings(user));
  const pets = DataService.getPets(user);
  const [showAdd, setShowAdd] = useState(false);

  // Form
  const [petId, setPetId] = useState(pets[0]?.id || '');
  const [servicesInput, setServicesInput] = useState('Hydrobath, Nail Dremel, Ear Cleaning');
  const [appointmentDate, setAppointmentDate] = useState('2026-11-06');
  const [appointmentTime, setAppointmentTime] = useState('11:00 AM');
  const [groomerName, setGroomerName] = useState('Elena Rostova');
  const [price, setPrice] = useState(1800);
  const [notes, setNotes] = useState('');

  const isOwner = role === 'owner';

  const handleStatusChange = (id: string, newStatus: GroomingAppointment['status']) => {
    try {
      DataService.updateGroomingStatus(id, newStatus, role || undefined);
      setGroomings(DataService.getGroomings(user));
    } catch (err: any) {
      alert(err.message || 'Permission denied');
    }
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const selPet = pets.find((p) => p.id === petId) || pets[0];
    if (!selPet) {
      alert('Please register a pet first.');
      return;
    }

    DataService.addGrooming({
      petId: selPet.id,
      petName: selPet.name,
      ownerName: selPet.ownerName,
      services: servicesInput.split(',').map((s) => s.trim()),
      appointmentDate,
      appointmentTime,
      groomerName,
      status: 'Scheduled',
      price: Number(price),
      notes: notes || undefined,
    });

    setGroomings(DataService.getGroomings(user));
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Grooming & Spa Salon</h1>
          <p className="text-xs text-slate-500">
            Hydrotherapy baths, breed-specific styling, claw therapy, and styling queues.
          </p>
        </div>
        {!isOwner && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Book Grooming Appointment
          </button>
        )}
      </div>

      {isOwner && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Read-Only Mode:</strong> Pet Parents can view grooming progress, scheduled services, and styling
            notes. Status updates (Scheduled, In-Progress, Ready for Pickup, Completed) are set by the Salon Team.
          </div>
        </div>
      )}

      {/* Grooming Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {groomings.map((g) => (
          <div
            key={g.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{g.petName}</h3>
                  <div className="text-slate-400 text-xs">Parent: {g.ownerName}</div>
                </div>
                <span className="font-black text-emerald-600 text-sm">{formatINR(g.price)}</span>
              </div>

              <div className="mt-2.5 text-xs text-slate-700">
                <span className="font-bold block text-slate-800 mb-0.5">Services:</span>
                <div className="flex flex-wrap gap-1">
                  {g.services.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-0.5">
                <div>Date: <strong>{g.appointmentDate} at {g.appointmentTime}</strong></div>
                <div>Stylist: <strong>{g.groomerName}</strong></div>
                {g.notes && <div className="text-slate-400 italic mt-1">"{g.notes}"</div>}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Appointment Status:
              </label>
              {isOwner ? (
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold inline-block border ${
                    g.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : g.status === 'Ready for Pickup'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      : g.status === 'In-Progress'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}
                >
                  {g.status}
                </span>
              ) : (
                <select
                  value={g.status}
                  onChange={(e) => handleStatusChange(g.id, e.target.value as any)}
                  className={`w-full p-2 rounded-xl text-xs font-bold border focus:outline-none ${
                    g.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : g.status === 'Ready for Pickup'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                      : g.status === 'In-Progress'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-blue-50 text-blue-800 border-blue-300'
                  }`}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Completed">Completed</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-800">Book Grooming & Spa Appointment</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAppointment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Patient *</label>
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species} - {p.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Services (comma separated) *</label>
                <input
                  required
                  placeholder="e.g. Hydrobath, Breed Styling, Claw Therapy"
                  value={servicesInput}
                  onChange={(e) => setServicesInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Time *</label>
                  <input
                    required
                    placeholder="10:30 AM"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Assigned Stylist *</label>
                  <input
                    required
                    value={groomerName}
                    onChange={(e) => setGroomerName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min={500}
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Grooming Notes</label>
                <input
                  placeholder="Hypoallergenic shampoo, sensitive paws..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Schedule Appointment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 7. CLINICAL MEDICAL RECORDS MODULE
// ==========================================
export const MedicalRecordsView: React.FC = () => {
  const { user, role } = useAuth();
  const [records, setRecords] = useState(() => DataService.getMedicalRecords());
  const pets = DataService.getPets();
  const [showAdd, setShowAdd] = useState(false);

  // Form
  const [petId, setPetId] = useState(pets[0]?.id || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [temperature, setTemperature] = useState(38.4);
  const [heartRate, setHeartRate] = useState(90);
  const [respiratoryRate, setRespiratoryRate] = useState(24);
  const [weight, setWeight] = useState(25);
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpDate, setFollowUpDate] = useState('2026-11-15');

  const canManage = role === 'admin' || role === 'doctor';

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const selPet = pets.find((p) => p.id === petId);
    if (!selPet) return;

    try {
      DataService.addMedicalRecord(
        {
          petId: selPet.id,
          petName: selPet.name,
          date: new Date().toISOString().split('T')[0],
          doctorName: user?.name || 'Dr. Marcus Vance, DVM',
          doctorEmail: user?.email || 'doctor@petcare.com',
          diagnosis,
          symptoms,
          vitals: {
            temperature: Number(temperature),
            heartRate: Number(heartRate),
            respiratoryRate: Number(respiratoryRate),
            weight: Number(weight),
          },
          treatmentPlan,
          followUpDate: followUpDate || undefined,
        },
        role || undefined
      );

      setRecords(DataService.getMedicalRecords());
      setShowAdd(false);
      setDiagnosis('');
      setSymptoms('');
      setTreatmentPlan('');
    } catch (err: any) {
      alert(err.message || 'Permission denied');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Clinical Medical Records</h1>
          <p className="text-xs text-slate-500">
            Attending veterinarian examinations, vital signs, diagnoses, and treatment plans.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Record Clinical Examination
          </button>
        )}
      </div>

      <div className="space-y-4">
        {records.map((r) => (
          <div
            key={r.id}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-800">{r.petName}</h3>
                  <span className="text-xs text-slate-400">Examined by {r.doctorName}</span>
                </div>
              </div>
              <span className="font-mono text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
                {r.date}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Clinical Diagnosis</span>
                <div className="text-slate-900 font-bold text-sm bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {r.diagnosis}
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Presented Symptoms</span>
                <div className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {r.symptoms || 'None reported'}
                </div>
              </div>
            </div>

            {/* Vitals Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
              <div className="bg-emerald-50/50 border border-emerald-100 p-2 rounded-xl">
                <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Body Temp</span>
                <strong className="text-emerald-950 font-bold">{r.vitals.temperature}°C</strong>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 p-2 rounded-xl">
                <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Heart Rate</span>
                <strong className="text-emerald-950 font-bold">{r.vitals.heartRate} bpm</strong>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 p-2 rounded-xl">
                <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Resp. Rate</span>
                <strong className="text-emerald-950 font-bold">{r.vitals.respiratoryRate} /min</strong>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 p-2 rounded-xl">
                <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Exam Weight</span>
                <strong className="text-emerald-950 font-bold">{r.vitals.weight} kg</strong>
              </div>
            </div>

            <div className="pt-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Prescribed Treatment Plan
              </span>
              <p className="text-slate-700 bg-teal-50/30 p-3 rounded-2xl border border-teal-100 font-medium">
                {r.treatmentPlan}
              </p>
            </div>

            {r.followUpDate && (
              <div className="text-[11px] text-teal-800 font-semibold flex items-center gap-1.5 pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Recommended Clinical Follow-Up: {r.followUpDate}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Record Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-800">Record Clinical Examination</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Patient *</label>
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Diagnosis *</label>
                <input
                  required
                  placeholder="e.g. Acute Otitis Externa, Hip Stifle Strain"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Presented Symptoms</label>
                <input
                  placeholder="e.g. Head shaking, ear scratching, mild erythema"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Temp (°C) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Heart (bpm) *</label>
                  <input
                    type="number"
                    required
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Resp (/min) *</label>
                  <input
                    type="number"
                    required
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Treatment Plan *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Medication regimen, dietary changes, wound cleaning..."
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Save Clinical Examination Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 8. SMART CARE MONITOR MODULE
// ==========================================
export const SmartCareMonitor: React.FC = () => {
  const { user } = useAuth();
  const [telemetry, setTelemetry] = useState(() => DataService.getTelemetry(user));
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSimulateUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => {
      DataService.simulateTelemetryUpdate();
      setTelemetry(DataService.getTelemetry(user));
      setIsUpdating(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-xl font-bold text-slate-800">Smart Care Monitor</h1>
          </div>
          <p className="text-xs text-slate-500">
            Simulated real-time physiological biometrics, cardiac pulse, body temp, and suite climate.
          </p>
        </div>

        <button
          onClick={handleSimulateUpdate}
          disabled={isUpdating}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
          <span>Simulate Sensor Reading</span>
        </button>
      </div>

      {/* Clear Simulation Disclosure Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-slate-900">Simulated Pet Care Telemetry • Demo Environment</strong>
          All vital signs, ambient temperatures, and camera feeds displayed below are generated dynamically for
          demonstration and training purposes. No physical IoT collar or optical camera hardware is currently attached.
        </div>
      </div>

      {telemetry.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <Activity className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-700">No active suite telemetry</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Live vital signs, room climate, and suite cameras activate automatically once your registered pet is checked in to a boarding suite.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {telemetry.map((t) => (
            <div
              key={t.petId}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs hover:shadow-xs transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-black text-base text-slate-900">{t.petName}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">Sync: {t.lastSyncTime}</span>
                </div>
                <span className="font-mono text-[11px] bg-teal-50 text-teal-800 px-2.5 py-1 rounded-xl font-bold border border-teal-200">
                  {t.roomNumber}
                </span>
              </div>

              {/* Simulated Live Camera Box */}
              <div className="h-44 bg-slate-950 rounded-2xl overflow-hidden relative flex items-center justify-center group shadow-inner">
                <img
                  src={
                    t.petName === 'Barnaby'
                      ? 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600'
                      : t.petName === 'Cleo'
                      ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600'
                      : 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600'
                  }
                  alt={t.petName}
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/70 text-white text-[10px] font-mono backdrop-blur-xs border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>CAM 01 • {t.cameraStatus}</span>
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-emerald-300">
                  HD 1080p (Simulated)
                </div>
              </div>

              {/* Vital Signs Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cardiac Pulse</span>
                  <span className="font-black text-slate-800 text-sm mt-0.5 block">{t.heartRate} bpm</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Body Temp</span>
                  <span className="font-black text-slate-800 text-sm mt-0.5 block">{t.bodyTemp}°C</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Activity State</span>
                  <span className="font-black text-emerald-700 text-sm mt-0.5 block">{t.activityLevel}</span>
                </div>
              </div>

              {/* Climate Bar */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                <span>Suite Climate (HVAC):</span>
                <span className="font-bold text-slate-800">
                  {t.ambientTemp}°C • {t.humidity}% Humidity
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 9. INVOICES & PAYMENTS MODULE
// ==========================================
export const InvoicesPayments: React.FC = () => {
  const { user, role } = useAuth();
  const [invoices, setInvoices] = useState(() => DataService.getInvoices(user));
  const pets = DataService.getPets(user);
  const [selectedReceipt, setSelectedReceipt] = useState<Invoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [payMethod, setPayMethod] = useState<'Credit Card' | 'Cash' | 'Online Transfer'>('Credit Card');
  const [showAdd, setShowAdd] = useState(false);

  // New Invoice Form
  const [petId, setPetId] = useState(pets[0]?.id || '');
  const [itemDesc, setItemDesc] = useState('Deluxe Suite Boarding (3 nights)');
  const [itemQty, setItemQty] = useState(3);
  const [itemPrice, setItemPrice] = useState(2500);
  const [dueDate, setDueDate] = useState('2026-11-20');

  const canCreate = role === 'admin' || role === 'staff';

  const handlePay = (id: string, method: Invoice['paymentMethod']) => {
    try {
      DataService.markInvoicePaid(id, method, user);
      setInvoices(DataService.getInvoices(user));
      setPayingInvoice(null);
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
    }
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const selPet = pets.find((p) => p.id === petId) || pets[0];
    if (!selPet) {
      alert('Please select or register a pet before creating an invoice.');
      return;
    }

    const subtotal = itemQty * itemPrice;
    const tax = parseFloat((subtotal * 0.18).toFixed(2));
    const total = subtotal + tax;

    DataService.addInvoice({
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      petId: selPet.id,
      petName: selPet.name,
      ownerId: selPet.ownerId,
      ownerName: selPet.ownerName,
      date: new Date().toISOString().split('T')[0],
      dueDate,
      items: [{ description: itemDesc, quantity: itemQty, unitPrice: itemPrice, total: subtotal }],
      subtotal,
      tax,
      total,
      status: 'Pending',
    });

    setInvoices(DataService.getInvoices(user));
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Invoices & Financial Billing</h1>
          <p className="text-xs text-slate-500">Itemized statements, subtotal, tax calculations, and receipts.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create New Invoice
          </button>
        )}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200/80">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Patient & Owner</th>
                <th className="p-4">Billing Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Subtotal / Tax</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No billing statements or invoices found on file.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono font-bold text-slate-800">{inv.invoiceNumber}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{inv.petName}</div>
                    <div className="text-[10px] text-slate-400">{inv.ownerName}</div>
                  </td>
                  <td className="p-4 text-slate-500">{inv.date}</td>
                  <td className="p-4 text-slate-500">{inv.dueDate}</td>
                  <td className="p-4 text-slate-600">
                    {formatINR(inv.subtotal)} + {formatINR(inv.tax)} GST
                  </td>
                  <td className="p-4 font-black text-slate-900 text-sm">{formatINR(inv.total)}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedReceipt(inv)}
                      className="px-2.5 py-1 text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg font-bold"
                    >
                      Receipt
                    </button>
                    {inv.status !== 'Paid' && (
                      <button
                        onClick={() => setPayingInvoice(inv)}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-2xs"
                      >
                        Settle
                      </button>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-600 tracking-wider">
                  PetCare Smart Clinic Receipt
                </span>
                <h3 className="font-mono font-bold text-base text-slate-900">{selectedReceipt.invoiceNumber}</h3>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="flex justify-between text-slate-600">
                <div>Patient: <strong>{selectedReceipt.petName}</strong></div>
                <div>Owner: <strong>{selectedReceipt.ownerName}</strong></div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] font-bold border-b">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReceipt.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{it.description}</td>
                        <td className="p-2 text-center">{it.quantity}</td>
                        <td className="p-2 text-right">{formatINR(it.unitPrice)}</td>
                        <td className="p-2 text-right font-bold">{formatINR(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-1 text-slate-600 text-xs text-right pr-2">
                <div>Subtotal: <strong>{formatINR(selectedReceipt.subtotal)}</strong></div>
                <div>GST (18%): <strong>{formatINR(selectedReceipt.tax)}</strong></div>
                <div className="text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                  Total: {formatINR(selectedReceipt.total)}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border text-[11px] text-slate-500">
                Status: <strong className="text-emerald-700">{selectedReceipt.status}</strong>
                {selectedReceipt.paymentMethod && ` via ${selectedReceipt.paymentMethod}`}
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* Settle / Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-800">Process Payment</h2>
              <button onClick={() => setPayingInvoice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="font-mono font-bold">{payingInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Due:</span>
                <span className="font-black text-emerald-600 text-sm">{formatINR(payingInvoice.total)}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
              <strong>Simulated Payment Gateway:</strong> Transaction will be recorded for demonstration purposes.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Credit Card">Credit / Debit Card (Simulated)</option>
                <option value="Cash">Cash at Front Desk</option>
                <option value="Online Transfer">UPI / NetBanking / Online Transfer</option>
              </select>
            </div>

            <button
              onClick={() => handlePay(payingInvoice.id, payMethod)}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition text-xs"
            >
              Confirm Settlement of {formatINR(payingInvoice.total)}
            </button>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-800">Generate New Patient Invoice</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Select Patient *</label>
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Service Description *</label>
                <input
                  required
                  placeholder="e.g. Deluxe Suite Boarding (5 nights)"
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={itemQty}
                    onChange={(e) => setItemQty(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="10"
                    min={100}
                    required
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Payment Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Create Invoice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 10. REPORTS & ANALYTICS MODULE
// ==========================================
export const ReportsAnalytics: React.FC = () => {
  const { user } = useAuth();
  const pets = DataService.getPets(user);
  const bookings = DataService.getBookings(user);
  const invoices = DataService.getInvoices(user);
  const feedings = DataService.getFeedings(user);
  const medications = DataService.getMedications(user);
  const vaccinations = DataService.getVaccinations(user);
  const groomings = DataService.getGroomings(user);
  const medicalRecords = DataService.getMedicalRecords(user);

  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || '');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const paidRevenue = invoices.reduce((s, i) => s + (i.status === 'Paid' ? i.total : 0), 0);
  const pendingRevenue = invoices.reduce((s, i) => s + (i.status === 'Pending' ? i.total : 0), 0);
  const totalTax = invoices.reduce((s, i) => s + i.tax, 0);

  const totalSuites = 12;
  const boardedCount = pets.filter((p) => p.isBoarded).length;
  const occupancyRate = Math.round((boardedCount / totalSuites) * 100);

  // Species distribution dynamically calculated
  const speciesMap: Record<string, number> = {};
  pets.forEach((p) => {
    speciesMap[p.species] = (speciesMap[p.species] || 0) + 1;
  });

  const handleExportIndividual = () => {
    const targetPet = pets.find((p) => p.id === selectedPetId) || pets[0];
    if (!targetPet) {
      alert('Please register or select a pet first.');
      return;
    }
    exportPetExcelReport({
      pet: targetPet,
      bookings,
      feedings,
      medications,
      vaccinations,
      groomings,
      medicalRecords,
      invoices,
    });
    setExportNotice(`Generated Excel dossier for ${targetPet.name} (.xlsx)`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportMaster = () => {
    exportAllPetsExcelReport({
      pets,
      bookings,
      feedings,
      medications,
      vaccinations,
      groomings,
      medicalRecords,
      invoices,
    });
    setExportNotice('Generated Master Operations Excel Workbook (.xlsx)');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleModular = (mod: 'boarding' | 'vaccinations' | 'medications' | 'feeding' | 'grooming' | 'billing') => {
    let data: any[] = [];
    if (mod === 'boarding') data = bookings;
    if (mod === 'vaccinations') data = vaccinations;
    if (mod === 'medications') data = medications;
    if (mod === 'feeding') data = feedings;
    if (mod === 'grooming') data = groomings;
    if (mod === 'billing') data = invoices;

    exportModularExcelReport(mod, data);
    setExportNotice(`Generated ${mod.toUpperCase()} Excel Report (.xlsx)`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Hospital Reports & Operations Analytics</h1>
          <p className="text-xs text-slate-500">
            Financial summaries, suite occupancy metrics, and clinical Excel export center grounded in live application records.
          </p>
        </div>

        <button
          onClick={handleExportMaster}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export Master Operations (.xlsx)
        </button>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{exportNotice}</span>
          </div>
          <button onClick={() => setExportNotice(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Net Income</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{formatINR(paidRevenue)}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Excluding pending billing</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pending Receivables</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{formatINR(pendingRevenue)}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Awaiting customer payment</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Suite Occupancy Rate</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{occupancyRate}%</div>
          <span className="text-[11px] text-teal-600 font-semibold mt-0.5 block">
            {boardedCount} of {totalSuites} suites currently booked
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Registered Patients</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{pets.length}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Across all patient species</span>
        </div>
      </div>

      {/* Excel Reports & Pet Dossier Center */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Patient Dossier & Operational Excel Reports (.xlsx)
            </h2>
            <p className="text-xs text-slate-500">
              Generate formatted multi-sheet Excel files with medical charts, vaccinations, feedings, and itemized billing.
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 self-start sm:self-auto">
            Authorized Staff & Doctor Tool
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Individual Pet Dossier Export */}
          <div className="lg:col-span-2 p-5 bg-gradient-to-tr from-slate-50 to-teal-50/40 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              1. Individual Patient Dossier Export
            </h3>
            <p className="text-xs text-slate-500">
              Select an individual patient to generate an 8-sheet comprehensive Excel dossier covering profile, boardings, diets, prescriptions, vaccines, grooming, consultations, and billing.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <select
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs"
              >
                {pets.length === 0 ? (
                  <option value="">No pets registered</option>
                ) : (
                  pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species} - {p.breed}) • Owner: {p.ownerName}
                    </option>
                  ))
                )}
              </select>

              <button
                onClick={handleExportIndividual}
                disabled={pets.length === 0}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> Export Pet Report (.xlsx)
              </button>
            </div>
          </div>

          {/* Master Export Card */}
          <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-900">
                2. Master Operations Workbook
              </h3>
              <p className="text-xs text-emerald-800/80 mt-1">
                Generates a unified operational Excel workbook compiling all active patients, room assignments, vaccine schedules, prescriptions, and financial reconciliations.
              </p>
            </div>
            <button
              onClick={handleExportMaster}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Export All Pets (.xlsx)
            </button>
          </div>
        </div>

        {/* Modular Downloads */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
            Modular Department Reports (.xlsx):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleModular('boarding')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" /> Boarding Stays
            </button>
            <button
              onClick={() => handleModular('vaccinations')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Syringe className="w-3.5 h-3.5 text-slate-500" /> Vaccination Registry
            </button>
            <button
              onClick={() => handleModular('medications')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Pill className="w-3.5 h-3.5 text-slate-500" /> Medication Logs
            </button>
            <button
              onClick={() => handleModular('feeding')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-slate-500" /> Feeding Schedules
            </button>
            <button
              onClick={() => handleModular('grooming')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Scissors className="w-3.5 h-3.5 text-slate-500" /> Grooming Appointments
            </button>
            <button
              onClick={() => handleModular('billing')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-500" /> Financial Billing
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Species Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h2 className="font-bold text-sm text-slate-800">Species Demographics</h2>
          <div className="space-y-2.5">
            {pets.length === 0 ? (
              <div className="text-slate-400 py-6 text-center text-xs">No registered pets in system.</div>
            ) : (
              Object.entries(speciesMap).map(([sp, count]) => {
                const pct = Math.round((count / pets.length) * 100);
                return (
                  <div key={sp} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{sp}s</span>
                      <span>{count} pets ({pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Boarding Reservation Status */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h2 className="font-bold text-sm text-slate-800">Boarding Reservation Status</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Checked-In</span>
              <span className="text-xl font-black text-emerald-600">
                {bookings.filter((b) => b.status === 'Checked-In').length}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Confirmed</span>
              <span className="text-xl font-black text-blue-600">
                {bookings.filter((b) => b.status === 'Confirmed').length}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Completed</span>
              <span className="text-xl font-black text-slate-700">
                {bookings.filter((b) => b.status === 'Completed').length}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Cancelled</span>
              <span className="text-xl font-black text-rose-600">
                {bookings.filter((b) => b.status === 'Cancelled').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 11. USER MANAGEMENT MODULE (ADMIN ONLY)
// ==========================================
export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState(() => AuthService.getAllUsers());
  const { resetDemoData } = useAuth();
  const [showAdd, setShowAdd] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [department, setDepartment] = useState('');
  const [tempPassword, setTempPassword] = useState('password123');

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await AuthService.addUser({
      name,
      email,
      phone,
      role,
      department: department || undefined,
      passwordHash: tempPassword,
    });
    setUsers(AuthService.getAllUsers());
    setShowAdd(false);
    setName('');
    setEmail('');
    setPhone('');
    setDepartment('');
  };

  const handleDelete = (id: string, userName: string) => {
    if (id === 'usr_admin_01') {
      alert('The root Administrator account (usr_admin_01) cannot be deleted.');
      return;
    }
    if (window.confirm(`Delete user account for "${userName}"?`)) {
      AuthService.deleteUser(id);
      setUsers(AuthService.getAllUsers());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">User & RBAC Security Management</h1>
          <p className="text-xs text-slate-500">
            Hospital administration, role-based authorization, and credential management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (
                window.confirm(
                  'Restore original default demo accounts? Note: Any custom accounts created by users will be preserved!'
                )
              ) {
                resetDemoData();
                setUsers(AuthService.getAllUsers());
                alert('Default demo credentials restored without overwriting user accounts.');
              }
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restore Demo Defaults
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add User Account
          </button>
        </div>
      </div>

      {/* Security Architecture Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 text-xs text-slate-700 flex items-start gap-3">
        <Shield className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-slate-900">Client-Side Authentication Architecture</strong>
          Authentication and user credentials in this demonstration build are persisted locally within the browser’s
          localStorage. For an enterprise healthcare deployment, replace client-side token management with a hardened
          JWT / OAuth 2.0 backend and server-authoritative database permissions.
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200/80">
              <tr>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Role Key</th>
                <th className="p-4">Department / Specialization</th>
                <th className="p-4">Phone</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 flex items-center gap-2.5">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{u.id}</div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-600">{u.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] border ${
                        u.role === 'admin'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : u.role === 'doctor'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : u.role === 'staff'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{u.department || u.specialization || 'General'}</td>
                  <td className="p-4 font-mono text-slate-500">{u.phone || 'N/A'}</td>
                  <td className="p-4 text-right">
                    {u.id !== 'usr_admin_01' && (
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-800">Add Clinic User Account</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Full Name *</label>
                <input
                  required
                  placeholder="e.g. Dr. Jennifer Adams"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@petcare.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="doctor">Veterinary Doctor</option>
                    <option value="staff">Care Staff</option>
                    <option value="admin">Administrator</option>
                    <option value="owner">Pet Owner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Phone</label>
                  <input
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Department / Specialty</label>
                <input
                  placeholder="e.g. Surgical Ward, Dermatology"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Temporary Initial Password *</label>
                <input
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 12. NOTIFICATIONS & ALERTS MODULE
// ==========================================
export const NotificationsView: React.FC = () => {
  const { role, user } = useAuth();
  const [notifs, setNotifs] = useState(() => DataService.getNotifications(user));
  const [showAdd, setShowAdd] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationItem['type']>('info');
  const [targetRole, setTargetRole] = useState<UserRole | 'all'>('all');

  const filteredNotifs = notifs.filter(
    (n) => n.targetRole === 'all' || !role || n.targetRole === role
  );

  const handleMarkRead = (id: string) => {
    DataService.markNotificationRead(id);
    setNotifs(DataService.getNotifications(user));
  };

  const handleClearAll = () => {
    DataService.markAllNotificationsRead();
    setNotifs(DataService.getNotifications(user));
  };

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    DataService.addNotification({
      title,
      message,
      type,
      targetRole,
    });
    setNotifs(DataService.getNotifications(user));
    setShowAdd(false);
    setTitle('');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">System Notifications & Clinical Alerts</h1>
          <p className="text-xs text-slate-500">
            Pending vaccination reminders, scheduled meal alerts, and patient care broadcasts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearAll}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Mark All Read
          </button>
          {role !== 'owner' && (
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Broadcast Alert
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-bold text-sm text-slate-700">No active alerts for your role</div>
            <p className="text-xs text-slate-400">All notifications have been reviewed.</p>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-3xl border transition flex items-start justify-between gap-4 shadow-2xs ${
                n.isRead ? 'bg-white border-slate-200/80 opacity-75' : 'bg-white border-teal-200 ring-1 ring-teal-100'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    n.type === 'alert'
                      ? 'bg-rose-50 text-rose-600'
                      : n.type === 'warning'
                      ? 'bg-amber-50 text-amber-600'
                      : n.type === 'success'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{n.title}</h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                    <span>{n.timestamp}</span>
                    <span>Target: {n.targetRole ? n.targetRole.toUpperCase() : 'ALL'}</span>
                  </div>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Alert Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-800">Broadcast Care Alert</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAlert} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Alert Title *</label>
                <input
                  required
                  placeholder="e.g. Scheduled Maintenance or Patient Alert"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Message *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter detailed notice content..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="alert">Alert / Urgent</option>
                    <option value="success">Success</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Target Audience *</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="all">Everyone</option>
                    <option value="doctor">Doctors</option>
                    <option value="staff">Care Staff</option>
                    <option value="owner">Pet Owners</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Broadcast Notice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
