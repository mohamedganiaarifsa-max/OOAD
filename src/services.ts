import {
  User,
  UserRole,
  Pet,
  Booking,
  FeedingSchedule,
  Medication,
  Vaccination,
  GroomingAppointment,
  MedicalRecord,
  SmartCareTelemetry,
  NotificationItem,
  Invoice,
} from './types';
import { formatINR } from './utils/currency';

export { formatINR };

export interface AuthAccount extends User {
  passwordHash: string;
}

const STORAGE_USERS_KEY = 'petcare_registered_users_v2';
const STORAGE_SESSION_KEY = 'petcare_auth_session_v2';

/**
 * Standard password hashing using Web Crypto SHA-256 with robust fallback.
 */
export async function hashPassword(str: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(str);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // fallback if subtle crypto is unavailable
  }
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return 'hash_' + (hash >>> 0).toString(16);
}

export const DEFAULT_DEMO_ACCOUNTS: AuthAccount[] = [
  {
    id: 'usr_admin_01',
    email: 'admin@petcare.com',
    passwordHash: 'admin123',
    name: 'Dr. Sarah Jenkins',
    role: 'admin',
    department: 'Hospital Administration',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-01T08:00:00Z',
  },
  {
    id: 'usr_doctor_01',
    email: 'doctor@petcare.com',
    passwordHash: 'doctor123',
    name: 'Dr. Marcus Vance, DVM',
    role: 'doctor',
    specialization: 'Senior Veterinary Surgeon & Diagnostician',
    phone: '+91 98765 43211',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-05T08:00:00Z',
  },
  {
    id: 'usr_staff_01',
    email: 'staff@petcare.com',
    passwordHash: 'staff123',
    name: 'Elena Rostova',
    role: 'staff',
    department: 'Boarding & Intensive Care Lead',
    phone: '+91 98765 43212',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'usr_owner_01',
    email: 'owner@petcare.com',
    passwordHash: 'owner123',
    name: 'David & Clara Miller',
    role: 'owner',
    phone: '+91 98765 43213',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-12T08:00:00Z',
  },
];

export class AuthService {
  public static initUsers(): AuthAccount[] {
    try {
      const stored = localStorage.getItem(STORAGE_USERS_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_DEMO_ACCOUNTS));
        return DEFAULT_DEMO_ACCOUNTS;
      }
      let parsed: AuthAccount[];
      try {
        parsed = JSON.parse(stored);
        if (!Array.isArray(parsed) || parsed.length === 0) throw new Error();
      } catch {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_DEMO_ACCOUNTS));
        return DEFAULT_DEMO_ACCOUNTS;
      }

      let updated = false;
      const healedList = [...parsed];
      for (const demo of DEFAULT_DEMO_ACCOUNTS) {
        const idx = healedList.findIndex(
          (u) => u.email.trim().toLowerCase() === demo.email.trim().toLowerCase()
        );
        if (idx === -1) {
          healedList.push(demo);
          updated = true;
        } else if (
          healedList[idx].passwordHash !== demo.passwordHash ||
          healedList[idx].role !== demo.role
        ) {
          healedList[idx] = { ...healedList[idx], passwordHash: demo.passwordHash, role: demo.role };
          updated = true;
        }
      }
      if (updated) localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(healedList));
      return healedList;
    } catch {
      return DEFAULT_DEMO_ACCOUNTS;
    }
  }

  /**
   * Resets demo accounts back to default state WITHOUT overwriting user-created accounts.
   */
  public static resetDemoAccounts(): void {
    const existing = this.initUsers();
    // Preserve any user-created accounts that are NOT part of the default demo credentials
    const userCreated = existing.filter(
      (u) => !DEFAULT_DEMO_ACCOUNTS.some((d) => d.email.toLowerCase() === u.email.toLowerCase() || d.id === u.id)
    );
    const combined = [...DEFAULT_DEMO_ACCOUNTS, ...userCreated];
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(combined));
    localStorage.removeItem('petcare_users');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('petcare_session');
  }

  /**
   * Public registration: ONLY allowed as 'owner'.
   * Never permits registering as admin, doctor, or staff.
   */
  public static async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    const fullName = (data.name || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const phone = (data.phone || '').trim();
    const password = (data.password || '').trim();
    const confirmPassword = (data.confirmPassword || '').trim();

    if (!fullName || fullName.length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 characters).' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { success: false, error: 'Please provide a valid email address (e.g., name@example.com).' };
    }

    if (!phone || phone.length < 7) {
      return { success: false, error: 'Please provide a valid contact phone number.' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters in length.' };
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Password and Confirm Password do not match.' };
    }

    const users = this.initUsers();
    const existing = users.find((u) => u.email.trim().toLowerCase() === email);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in instead or use another email.',
      };
    }

    const hashed = await hashPassword(password);
    const newAccount: AuthAccount = {
      id: `usr_owner_${Date.now()}`,
      name: fullName,
      email,
      phone,
      role: 'owner', // Public registration is strictly restricted to Owner
      passwordHash: hashed,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };

    users.push(newAccount);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

    const { passwordHash: _, ...safeUser } = newAccount;
    // Auto login
    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(safeUser));
    } catch (e) {
      console.error(e);
    }

    return { success: true, user: safeUser };
  }

  public static async login(
    emailInput: string,
    passwordInput: string,
    expectedRole?: UserRole
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const email = (emailInput || '').trim().toLowerCase();
    const password = (passwordInput || '').trim();

    if (!email) return { success: false, error: 'Email address is required.' };
    if (!password) return { success: false, error: 'Password is required.' };

    const users = this.initUsers();
    const matched = users.find((u) => u.email.trim().toLowerCase() === email);

    if (!matched) {
      return { success: false, error: 'Invalid email or password. Please verify your credentials.' };
    }

    const hashedInput = await hashPassword(password);
    const passwordValid = matched.passwordHash === password || matched.passwordHash === hashedInput;

    if (!passwordValid) {
      return { success: false, error: 'Invalid password. Please check your spelling and try again.' };
    }

    if (expectedRole && matched.role !== expectedRole) {
      const roleTitles: Record<UserRole, string> = {
        admin: 'Administrator',
        doctor: 'Doctor / Veterinarian',
        staff: 'Care Staff',
        owner: 'Pet Owner',
      };
      return {
        success: false,
        error: `This account is registered with the role "${roleTitles[matched.role]}". Please use the ${roleTitles[matched.role]} portal.`,
      };
    }

    const { passwordHash: _, ...safeUser } = matched;
    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(safeUser));
    } catch (e) {
      console.error(e);
    }
    return { success: true, user: safeUser };
  }

  public static getCurrentSession(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_SESSION_KEY);
      if (!stored) return null;
      const user = JSON.parse(stored) as User;
      const valid: UserRole[] = ['admin', 'doctor', 'staff', 'owner'];
      if (!user || !user.id || !user.email || !valid.includes(user.role)) {
        this.logout();
        return null;
      }
      return user;
    } catch {
      this.logout();
      return null;
    }
  }

  public static logout(): void {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem('petcare_session');
    localStorage.removeItem('currentUser');
  }

  public static getAllUsers(): User[] {
    return this.initUsers().map(({ passwordHash: _, ...u }) => u);
  }

  public static async addUser(
    newUser: Omit<AuthAccount, 'id' | 'createdAt'>
  ): Promise<User> {
    const list = this.initUsers();
    const hashed = await hashPassword(newUser.passwordHash || 'password123');
    const user: AuthAccount = {
      ...newUser,
      email: newUser.email.trim().toLowerCase(),
      passwordHash: hashed,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.push(user);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list));
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  public static deleteUser(id: string): boolean {
    if (id === 'usr_admin_01') return false; // Prevent deleting root admin
    const list = this.initUsers().filter((u) => u.id !== id);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list));
    return true;
  }
}

// ------------------- Data Service (INR - Indian Rupees Pricing) -------------------

const INITIAL_PETS: Pet[] = [
  {
    id: 'pet_01',
    name: 'Barnaby',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 4,
    gender: 'Male',
    weight: 31.5,
    ownerId: 'usr_owner_01',
    ownerName: 'David & Clara Miller',
    ownerPhone: '+91 98765 43213',
    microchipId: '985-1410-0921-A',
    avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&auto=format&fit=crop&q=80',
    allergies: ['Chicken byproduct', 'Penicillin'],
    medicalNotes: 'Mild hip dysplasia history; requires low-impact exercise.',
    isBoarded: true,
    roomNumber: 'Suite 101',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'pet_02',
    name: 'Cleo',
    species: 'Cat',
    breed: 'Scottish Fold',
    age: 2,
    gender: 'Female',
    weight: 3.8,
    ownerId: 'usr_owner_01',
    ownerName: 'David & Clara Miller',
    ownerPhone: '+91 98765 43213',
    microchipId: '985-1410-8832-B',
    avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop&q=80',
    allergies: ['Dust mites'],
    medicalNotes: 'Sensitive gastrointestinal tract. Sensitive stomach wet food only.',
    isBoarded: true,
    roomNumber: 'Cat Condo C-3',
    createdAt: '2025-02-01T14:30:00Z',
  },
  {
    id: 'pet_03',
    name: 'Thor',
    species: 'Dog',
    breed: 'Siberian Husky',
    age: 3,
    gender: 'Male',
    weight: 27.2,
    ownerId: 'usr_owner_02',
    ownerName: 'Sarah Connor',
    ownerPhone: '+91 98765 43214',
    microchipId: '985-2239-0112-C',
    avatarUrl: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=300&auto=format&fit=crop&q=80',
    allergies: [],
    medicalNotes: 'Active; loves morning agility yard.',
    isBoarded: false,
    createdAt: '2025-02-10T09:15:00Z',
  },
  {
    id: 'pet_04',
    name: 'Luna',
    species: 'Cat',
    breed: 'Ragdoll',
    age: 1,
    gender: 'Female',
    weight: 4.1,
    ownerId: 'usr_owner_03',
    ownerName: 'Robert Vance',
    ownerPhone: '+91 98765 43215',
    microchipId: '985-9981-4433-D',
    avatarUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=300&auto=format&fit=crop&q=80',
    allergies: ['Soy'],
    medicalNotes: 'Routine wellness examination scheduled.',
    isBoarded: true,
    roomNumber: 'Cat Condo C-1',
    createdAt: '2025-02-18T11:00:00Z',
  },
  {
    id: 'pet_05',
    name: 'Cooper',
    species: 'Dog',
    breed: 'French Bulldog',
    age: 5,
    gender: 'Male',
    weight: 12.4,
    ownerId: 'usr_owner_04',
    ownerName: 'Emily Watson',
    ownerPhone: '+91 98765 43216',
    microchipId: '985-4421-7766-E',
    avatarUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&auto=format&fit=crop&q=80',
    allergies: ['Beef protein'],
    medicalNotes: 'Brachycephalic syndrome; keep in climate-controlled temperature.',
    isBoarded: true,
    roomNumber: 'VIP Penthouse 202',
    createdAt: '2025-02-22T16:00:00Z',
  },
  {
    id: 'pet_06',
    name: 'Kiwi',
    species: 'Bird',
    breed: 'Green-cheeked Conure',
    age: 2,
    gender: 'Female',
    weight: 0.08,
    ownerId: 'usr_owner_01',
    ownerName: 'David & Clara Miller',
    ownerPhone: '+91 98765 43213',
    microchipId: '985-6112-9901-F',
    avatarUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=300&auto=format&fit=crop&q=80',
    allergies: [],
    medicalNotes: 'Gentle handling. Enjoys fresh apple slices and seeds.',
    isBoarded: false,
    createdAt: '2025-03-01T08:00:00Z',
  },
  {
    id: 'pet_07',
    name: 'Snowball',
    species: 'Rabbit',
    breed: 'Holland Lop',
    age: 3,
    gender: 'Female',
    weight: 1.8,
    ownerId: 'usr_owner_01',
    ownerName: 'David & Clara Miller',
    ownerPhone: '+91 98765 43213',
    microchipId: '985-3341-2299-G',
    avatarUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=300&auto=format&fit=crop&q=80',
    allergies: ['Alfalfa hay (timothy only)'],
    medicalNotes: 'Requires unlimited Timothy hay and daily grooming for fur balls.',
    isBoarded: false,
    createdAt: '2025-03-10T09:30:00Z',
  },
];

// Realistic INR Pricing for Boarding (Standard: ₹950, Cat Condo: ₹1,500, Deluxe: ₹2,500, VIP: ₹4,000)
const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk_101',
    petId: 'pet_01',
    petName: 'Barnaby',
    ownerId: 'usr_owner_01',
    ownerName: 'David & Clara Miller',
    roomType: 'Deluxe Suite',
    roomNumber: 'Suite 101',
    checkInDate: '2026-10-06',
    checkOutDate: '2026-10-12',
    status: 'Checked-In',
    dailyRate: 2500, // ₹2,500 per night
    specialInstructions: 'Morning walk in agility yard; brush coat daily.',
    emergencyContact: '+91 98765 43219',
  },
  {
    id: 'bk_102',
    petId: 'pet_02',
    petName: 'Cleo',
    ownerId: 'usr_owner_01',
    ownerName: 'David & Clara Miller',
    roomType: 'Cat Condo',
    roomNumber: 'Cat Condo C-3',
    checkInDate: '2026-10-07',
    checkOutDate: '2026-10-11',
    status: 'Checked-In',
    dailyRate: 1500, // ₹1,500 per night
    specialInstructions: 'Calming pheromone diffuser active.',
    emergencyContact: '+91 98765 43219',
  },
  {
    id: 'bk_103',
    petId: 'pet_04',
    petName: 'Luna',
    ownerId: 'usr_owner_03',
    ownerName: 'Robert Vance',
    roomType: 'Cat Condo',
    roomNumber: 'Cat Condo C-1',
    checkInDate: '2026-10-08',
    checkOutDate: '2026-10-14',
    status: 'Checked-In',
    dailyRate: 1500, // ₹1,500 per night
    emergencyContact: '+91 98765 43220',
  },
  {
    id: 'bk_104',
    petId: 'pet_05',
    petName: 'Cooper',
    ownerId: 'usr_owner_04',
    ownerName: 'Emily Watson',
    roomType: 'VIP Penthouse',
    roomNumber: 'VIP Penthouse 202',
    checkInDate: '2026-10-09',
    checkOutDate: '2026-10-15',
    status: 'Checked-In',
    dailyRate: 4000, // ₹4,000 per night
    emergencyContact: '+91 98765 43221',
  },
];

const INITIAL_FEEDINGS: FeedingSchedule[] = [
  {
    id: 'fd_01',
    petId: 'pet_01',
    petName: 'Barnaby',
    mealType: 'Breakfast',
    scheduledTime: '08:00 AM',
    foodBrand: 'Royal Canin Golden Retriever Adult',
    portionGrams: 280,
    dietaryRestrictions: 'No chicken, add joint supplement oil',
    isCompleted: true,
    completedAt: '08:15 AM',
    staffName: 'Elena Rostova',
    notes: 'Ate all food enthusiastically.',
  },
  {
    id: 'fd_02',
    petId: 'pet_01',
    petName: 'Barnaby',
    mealType: 'Dinner',
    scheduledTime: '06:00 PM',
    foodBrand: 'Royal Canin Golden Retriever Adult',
    portionGrams: 280,
    dietaryRestrictions: 'No chicken',
    isCompleted: false,
    notes: 'Add fresh filtered water bowl.',
  },
  {
    id: 'fd_03',
    petId: 'pet_02',
    petName: 'Cleo',
    mealType: 'Breakfast',
    scheduledTime: '08:30 AM',
    foodBrand: "Hill's Science Diet Gastrointestinal Biome",
    portionGrams: 75,
    dietaryRestrictions: 'Sensitive stomach wet can only',
    isCompleted: true,
    completedAt: '08:35 AM',
    staffName: 'Elena Rostova',
    notes: 'Mixed with probiotic powder.',
  },
  {
    id: 'fd_04',
    petId: 'pet_05',
    petName: 'Cooper',
    mealType: 'Breakfast',
    scheduledTime: '08:15 AM',
    foodBrand: 'Purina Pro Plan Sensitive Salmon',
    portionGrams: 150,
    dietaryRestrictions: 'No beef protein',
    isCompleted: true,
    completedAt: '08:20 AM',
    staffName: 'Elena Rostova',
    notes: 'Slow-feeder bowl used.',
  },
];

const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med_01',
    petId: 'pet_01',
    petName: 'Barnaby',
    name: 'Carprofen (Rimadyl)',
    dosage: '75 mg chewable tablet',
    frequency: 'Once daily with breakfast',
    route: 'Oral',
    prescribedBy: 'Dr. Marcus Vance, DVM',
    startDate: '2026-10-01',
    endDate: '2026-10-15',
    isGivenToday: true,
    lastAdministered: 'Today, 08:15 AM',
    instructions: 'Administer with meal for stifle joint support.',
  },
  {
    id: 'med_02',
    petId: 'pet_02',
    petName: 'Cleo',
    name: 'FortiFlora Feline Probiotic',
    dosage: '1 sachet powder',
    frequency: 'Once daily with breakfast',
    route: 'Oral',
    prescribedBy: 'Dr. Marcus Vance, DVM',
    startDate: '2026-10-05',
    endDate: '2026-10-20',
    isGivenToday: true,
    lastAdministered: 'Today, 08:35 AM',
    instructions: 'Sprinkle completely over wet food.',
  },
  {
    id: 'med_03',
    petId: 'pet_05',
    petName: 'Cooper',
    name: 'Apoquel (Oclacitinib)',
    dosage: '5.4 mg tablet',
    frequency: 'Twice daily',
    route: 'Oral',
    prescribedBy: 'Dr. Marcus Vance, DVM',
    startDate: '2026-10-07',
    endDate: '2026-10-21',
    isGivenToday: false,
    instructions: 'Give inside hypoallergenic pill pocket.',
  },
];

const INITIAL_VACCINATIONS: Vaccination[] = [
  {
    id: 'vac_01',
    petId: 'pet_01',
    petName: 'Barnaby',
    vaccineName: 'Rabies 3-Year Vaccine',
    dateAdministered: '2024-05-12',
    dueDate: '2027-05-12',
    batchNumber: 'DEF-88392-RAB',
    administeredBy: 'Dr. Marcus Vance, DVM',
    status: 'Up to Date',
    certificateId: 'CERT-RAB-2024-019',
  },
  {
    id: 'vac_02',
    petId: 'pet_01',
    petName: 'Barnaby',
    vaccineName: 'DHPP (Distemper / Parvo)',
    dateAdministered: '2025-10-15',
    dueDate: '2026-10-15',
    batchNumber: 'VET-44912-DHPP',
    administeredBy: 'Dr. Marcus Vance, DVM',
    status: 'Due Soon',
    certificateId: 'CERT-DHPP-2025-412',
  },
  {
    id: 'vac_03',
    petId: 'pet_02',
    petName: 'Cleo',
    vaccineName: 'FVRCP (Feline Core 3-in-1)',
    dateAdministered: '2025-08-20',
    dueDate: '2026-08-20',
    batchNumber: 'FEL-99014-FVR',
    administeredBy: 'Dr. Marcus Vance, DVM',
    status: 'Overdue',
    certificateId: 'CERT-FVR-2025-110',
  },
];

// Realistic INR Pricing for Grooming (Hydrobath: ₹1,800, Lion Cut: ₹2,400, Spa & Balm: ₹1,600)
const INITIAL_GROOMING: GroomingAppointment[] = [
  {
    id: 'grm_01',
    petId: 'pet_01',
    petName: 'Barnaby',
    ownerName: 'David & Clara Miller',
    services: ['Hydrobath', 'Nail Dremel', 'Ear Cleaning'],
    appointmentDate: '2026-10-10',
    appointmentTime: '10:30 AM',
    groomerName: 'Elena Rostova',
    status: 'Scheduled',
    price: 1800, // ₹1,800
    notes: 'Sensitive skin shampoo requested.',
  },
  {
    id: 'grm_02',
    petId: 'pet_04',
    petName: 'Luna',
    ownerName: 'Robert Vance',
    services: ['Lion Cut Styling', 'Sanitary Trim'],
    appointmentDate: '2026-10-09',
    appointmentTime: '02:00 PM',
    groomerName: 'Elena Rostova',
    status: 'In-Progress',
    price: 2400, // ₹2,400
    notes: 'Extra calming music in grooming suite.',
  },
  {
    id: 'grm_03',
    petId: 'pet_05',
    petName: 'Cooper',
    ownerName: 'Emily Watson',
    services: ['Hydrotherapy Bath', 'Facial Fold Care', 'Paw Balm'],
    appointmentDate: '2026-10-08',
    appointmentTime: '11:00 AM',
    groomerName: 'Elena Rostova',
    status: 'Ready for Pickup',
    price: 1600, // ₹1,600
    notes: 'Skin folds dried and protected.',
  },
];

const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'rec_01',
    petId: 'pet_01',
    petName: 'Barnaby',
    date: '2026-10-06',
    doctorName: 'Dr. Marcus Vance, DVM',
    doctorEmail: 'doctor@petcare.com',
    diagnosis: 'Pre-Boarding Clinical Exam & Stifle Stiffness',
    symptoms: 'Subtle reluctance when rising.',
    vitals: { temperature: 38.4, heartRate: 88, respiratoryRate: 22, weight: 31.5 },
    treatmentPlan: 'Maintain daily Carprofen 75mg.',
    followUpDate: '2026-10-14',
  },
  {
    id: 'rec_02',
    petId: 'pet_02',
    petName: 'Cleo',
    date: '2026-10-07',
    doctorName: 'Dr. Marcus Vance, DVM',
    doctorEmail: 'doctor@petcare.com',
    diagnosis: 'Mild Stress-Induced Dysbiosis',
    symptoms: 'Soft stool prior to arrival, otherwise hydrated.',
    vitals: { temperature: 38.6, heartRate: 144, respiratoryRate: 28, weight: 3.8 },
    treatmentPlan: 'Initiate FortiFlora daily sachet in prescription wet food.',
    followUpDate: '2026-10-16',
  },
];

const INITIAL_TELEMETRY: SmartCareTelemetry[] = [
  {
    petId: 'pet_01',
    petName: 'Barnaby',
    roomNumber: 'Suite 101',
    status: 'Normal',
    heartRate: 78,
    bodyTemp: 38.3,
    activityLevel: 'Resting',
    ambientTemp: 21.5,
    humidity: 48,
    lastSyncTime: 'Just now',
    cameraStatus: 'Online',
  },
  {
    petId: 'pet_02',
    petName: 'Cleo',
    roomNumber: 'Cat Condo C-3',
    status: 'Normal',
    heartRate: 138,
    bodyTemp: 38.5,
    activityLevel: 'Sleeping',
    ambientTemp: 22.1,
    humidity: 46,
    lastSyncTime: 'Just now',
    cameraStatus: 'Online',
  },
  {
    petId: 'pet_05',
    petName: 'Cooper',
    roomNumber: 'VIP Penthouse 202',
    status: 'Normal',
    heartRate: 92,
    bodyTemp: 38.5,
    activityLevel: 'Moderate',
    ambientTemp: 20.8,
    humidity: 45,
    lastSyncTime: 'Just now',
    cameraStatus: 'Online',
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    title: 'Vaccine Due Soon: Barnaby',
    message: 'DHPP booster is due this week for Barnaby.',
    type: 'warning',
    targetRole: 'all',
    timestamp: '10 mins ago',
    isRead: false,
    link: 'vaccinations',
  },
  {
    id: 'notif_02',
    title: 'Evening Medication Scheduled',
    message: 'Boarded patients require evening medication rounds.',
    type: 'info',
    targetRole: 'staff',
    timestamp: '45 mins ago',
    isRead: false,
    link: 'medications',
  },
  {
    id: 'notif_03',
    title: 'Clinical Follow-up: Cleo',
    message: 'Review stool consistency and GI response to FortiFlora.',
    type: 'alert',
    targetRole: 'doctor',
    timestamp: '1 hour ago',
    isRead: false,
    link: 'records',
  },
];

// Realistic INR Invoices with 18% GST (Standard Indian GST Rate for Professional Services)
const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_01',
    invoiceNumber: 'INV-2026-1001',
    petId: 'pet_01',
    petName: 'Barnaby',
    ownerId: 'usr_owner_01',
    ownerName: 'David & Clara Miller',
    date: '2026-10-06',
    dueDate: '2026-10-13',
    items: [
      { description: 'Deluxe Suite Boarding (6 nights)', quantity: 6, unitPrice: 2500, total: 15000 },
      { description: 'Veterinary Admission Exam & Vitals', quantity: 1, unitPrice: 1200, total: 1200 },
    ],
    subtotal: 16200,
    tax: 2916, // 18% GST
    total: 19116,
    status: 'Paid',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'inv_02',
    invoiceNumber: 'INV-2026-1002',
    petId: 'pet_02',
    petName: 'Cleo',
    ownerId: 'usr_owner_01',
    ownerName: 'David & Clara Miller',
    date: '2026-10-07',
    dueDate: '2026-10-14',
    items: [
      { description: 'Cat Condo Boarding (4 nights)', quantity: 4, unitPrice: 1500, total: 6000 },
    ],
    subtotal: 6000,
    tax: 1080, // 18% GST
    total: 7080,
    status: 'Pending',
  },
];

function getStored<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return initial;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
}

export class DataService {
  public static resetAllData(): void {
    setStored('petcare_pets_data_v3', INITIAL_PETS);
    setStored('petcare_bookings_data_v3', INITIAL_BOOKINGS);
    setStored('petcare_feedings_data_v3', INITIAL_FEEDINGS);
    setStored('petcare_medications_data_v3', INITIAL_MEDICATIONS);
    setStored('petcare_vaccinations_data_v3', INITIAL_VACCINATIONS);
    setStored('petcare_grooming_data_v3', INITIAL_GROOMING);
    setStored('petcare_records_data_v3', INITIAL_MEDICAL_RECORDS);
    setStored('petcare_telemetry_data_v3', INITIAL_TELEMETRY);
    setStored('petcare_notifications_data_v3', INITIAL_NOTIFICATIONS);
    setStored('petcare_invoices_data_v3', INITIAL_INVOICES);
  }

  // Pets
  public static getPets(user?: User | null): Pet[] {
    const all = getStored<Pet[]>('petcare_pets_data_v3', INITIAL_PETS);
    if (user && user.role === 'owner') {
      return all.filter((p) => p.ownerId === user.id);
    }
    return all;
  }
  public static addPet(pet: Omit<Pet, 'id' | 'createdAt'>, user?: User | null): Pet {
    const all = getStored<Pet[]>('petcare_pets_data_v3', INITIAL_PETS);
    const ownerId = user && user.role === 'owner' ? user.id : (pet.ownerId || user?.id || 'usr_owner_01');
    const ownerName = user && user.role === 'owner' ? user.name : (pet.ownerName || user?.name || 'Pet Parent');
    const ownerPhone = user && user.role === 'owner' ? (user.phone || pet.ownerPhone || '') : (pet.ownerPhone || '');

    const newPet: Pet = {
      ...pet,
      id: `pet_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      ownerId,
      ownerName,
      ownerPhone,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newPet);
    setStored('petcare_pets_data_v3', all);
    return newPet;
  }
  public static updatePet(id: string, updates: Partial<Pet>, user?: User | null): Pet | null {
    const all = getStored<Pet[]>('petcare_pets_data_v3', INITIAL_PETS);
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    if (user && user.role === 'owner' && all[idx].ownerId !== user.id) {
      throw new Error('Permission Denied: You cannot edit another owner\'s pet.');
    }
    all[idx] = { ...all[idx], ...updates };
    setStored('petcare_pets_data_v3', all);
    return all[idx];
  }
  public static deletePet(id: string, user?: User | null): boolean {
    const all = getStored<Pet[]>('petcare_pets_data_v3', INITIAL_PETS);
    const target = all.find((p) => p.id === id);
    if (!target) return false;
    if (user && user.role === 'owner' && target.ownerId !== user.id) {
      throw new Error('Permission Denied: You cannot delete a pet belonging to another owner.');
    }
    const filtered = all.filter((p) => p.id !== id);
    setStored('petcare_pets_data_v3', filtered);
    return true;
  }

  // Bookings
  public static getBookings(user?: User | null): Booking[] {
    const all = getStored<Booking[]>('petcare_bookings_data_v3', INITIAL_BOOKINGS);
    if (user && user.role === 'owner') {
      const myPetIds = new Set(this.getPets(user).map((p) => p.id));
      return all.filter((b) => b.ownerId === user.id || myPetIds.has(b.petId));
    }
    return all;
  }
  public static addBooking(booking: Omit<Booking, 'id'>, user?: User | null): Booking {
    const allPets = getStored<Pet[]>('petcare_pets_data_v3', INITIAL_PETS);
    const targetPet = allPets.find((p) => p.id === booking.petId);
    if (user && user.role === 'owner') {
      if (!targetPet || targetPet.ownerId !== user.id) {
        throw new Error('Permission Denied: You can only book stays for your own registered pets.');
      }
    }
    const list = getStored<Booking[]>('petcare_bookings_data_v3', INITIAL_BOOKINGS);
    const item: Booking = { ...booking, id: `bk_${Date.now()}` };
    list.unshift(item);
    setStored('petcare_bookings_data_v3', list);
    return item;
  }
  public static updateBooking(id: string, updates: Partial<Booking>, actingRole?: UserRole, user?: User | null): Booking | null {
    // ENFORCE OWNER RESTRICTION IN SERVICE LAYER
    if (actingRole === 'owner' && updates.status !== undefined) {
      throw new Error('Permission Denied: Pet Owners are not permitted to change booking or boarding status.');
    }
    const list = getStored<Booking[]>('petcare_bookings_data_v3', INITIAL_BOOKINGS);
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    if (user && user.role === 'owner') {
      const myPetIds = new Set(this.getPets(user).map((p) => p.id));
      if (list[idx].ownerId !== user.id && !myPetIds.has(list[idx].petId)) {
        throw new Error('Permission Denied: You cannot modify another owner\'s booking.');
      }
    }
    list[idx] = { ...list[idx], ...updates };
    setStored('petcare_bookings_data_v3', list);
    return list[idx];
  }
  public static deleteBooking(id: string, user?: User | null): boolean {
    const list = getStored<Booking[]>('petcare_bookings_data_v3', INITIAL_BOOKINGS);
    const target = list.find((b) => b.id === id);
    if (!target) return false;
    if (user && user.role === 'owner' && target.ownerId !== user.id) {
      throw new Error('Permission Denied: You cannot delete another owner\'s booking.');
    }
    const filtered = list.filter((b) => b.id !== id);
    setStored('petcare_bookings_data_v3', filtered);
    return true;
  }

  // Feedings
  public static getFeedings(user?: User | null): FeedingSchedule[] {
    const all = getStored<FeedingSchedule[]>('petcare_feedings_data_v3', INITIAL_FEEDINGS);
    if (user && user.role === 'owner') {
      const myPetIds = new Set(this.getPets(user).map((p) => p.id));
      return all.filter((f) => myPetIds.has(f.petId));
    }
    return all;
  }
  public static toggleFeedingCompleted(id: string, staffName: string, actingRole?: UserRole): FeedingSchedule | null {
    // ENFORCE OWNER RESTRICTION IN SERVICE LAYER
    if (actingRole === 'owner') {
      throw new Error('Permission Denied: Pet Owners cannot modify feeding schedules or mark meals as completed.');
    }
    const list = getStored<FeedingSchedule[]>('petcare_feedings_data_v3', INITIAL_FEEDINGS);
    const idx = list.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    const isCompleted = !list[idx].isCompleted;
    list[idx] = {
      ...list[idx],
      isCompleted,
      completedAt: isCompleted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      staffName: isCompleted ? staffName : undefined,
    };
    setStored('petcare_feedings_data_v3', list);
    return list[idx];
  }
  public static addFeeding(f: Omit<FeedingSchedule, 'id'>, actingRole?: UserRole): FeedingSchedule {
    if (actingRole === 'owner') {
      throw new Error('Permission Denied: Pet Owners cannot create or edit feeding schedules.');
    }
    const list = getStored<FeedingSchedule[]>('petcare_feedings_data_v3', INITIAL_FEEDINGS);
    const item: FeedingSchedule = { ...f, id: `fd_${Date.now()}` };
    list.unshift(item);
    setStored('petcare_feedings_data_v3', list);
    return item;
  }
  public static deleteFeeding(id: string): boolean {
    const list = getStored<FeedingSchedule[]>('petcare_feedings_data_v3', INITIAL_FEEDINGS).filter((f) => f.id !== id);
    setStored('petcare_feedings_data_v3', list);
    return true;
  }

  // Medications
  public static getMedications(user?: User | null): Medication[] {
    const all = getStored<Medication[]>('petcare_medications_data_v3', INITIAL_MEDICATIONS);
    if (user && user.role === 'owner') {
      const myPetIds = new Set(this.getPets(user).map((p) => p.id));
      return all.filter((m) => myPetIds.has(m.petId));
    }
    return all;
  }
  public static toggleMedicationGiven(id: string, actingRole?: UserRole): Medication | null {
    // ENFORCE OWNER RESTRICTION IN SERVICE LAYER
    if (actingRole === 'owner') {
      throw new Error('Permission Denied: Pet Owners cannot edit medication or mark medication as administered.');
    }
    const list = getStored<Medication[]>('petcare_medications_data_v3', INITIAL_MEDICATIONS);
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    const isGiven = !list[idx].isGivenToday;
    list[idx] = {
      ...list[idx],
      isGivenToday: isGiven,
      lastAdministered: isGiven ? `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : undefined,
    };
    setStored('petcare_medications_data_v3', list);
    return list[idx];
  }
  public static addMedication(m: Omit<Medication, 'id'>, actingRole?: UserRole): Medication {
    if (actingRole === 'owner') {
      throw new Error('Permission Denied: Pet Owners cannot add or edit medications.');
    }
    const list = getStored<Medication[]>('petcare_medications_data_v3', INITIAL_MEDICATIONS);
    const item: Medication = { ...m, id: `med_${Date.now()}` };
    list.unshift(item);
    setStored('petcare_medications_data_v3', list);
    return item;
  }
  public static deleteMedication(id: string): boolean {
    const list = getStored<Medication[]>('petcare_medications_data_v3', INITIAL_MEDICATIONS).filter((m) => m.id !== id);
    setStored('petcare_medications_data_v3', list);
    return true;
  }

  // Vaccinations
  public static getVaccinations(user?: User | null): Vaccination[] {
    const all = getStored<Vaccination[]>('petcare_vaccinations_data_v3', INITIAL_VACCINATIONS);
    if (user && user.role === 'owner') {
      const myPetIds = new Set(this.getPets(user).map((p) => p.id));
      return all.filter((v) => myPetIds.has(v.petId));
    }
    return all;
  }
  public static addVaccination(v: Omit<Vaccination, 'id'>): Vaccination {
    const list = getStored<Vaccination[]>('petcare_vaccinations_data_v3', INITIAL_VACCINATIONS);
    const item: Vaccination = { ...v, id: `vac_${Date.now()}` };
    list.unshift(item);
    setStored('petcare_vaccinations_data_v3', list);
    return item;
  }
  public static deleteVaccination(id: string): boolean {
    const list = getStored<Vaccination[]>('petcare_vaccinations_data_v3', INITIAL_VACCINATIONS).filter((v) => v.id !== id);
    setStored('petcare_vaccinations_data_v3', list);
    return true;
  }

  // Grooming
  public static getGroomings(user?: User | null): GroomingAppointment[] {
    const all = getStored<GroomingAppointment[]>('petcare_grooming_data_v3', INITIAL_GROOMING);
    if (user && user.role === 'owner') {
      const myPetIds = new Set(this.getPets(user).map((p) => p.id));
      return all.filter((g) => myPetIds.has(g.petId));
    }
    return all;
  }
  public static updateGroomingStatus(
    id: string,
    status: GroomingAppointment['status'],
    actingRole?: UserRole
  ): GroomingAppointment | null {
    // ENFORCE OWNER RESTRICTION IN SERVICE LAYER
    if (actingRole === 'owner') {
      throw new Error('Permission Denied: Pet Owners cannot alter grooming salon appointment statuses.');
    }
    const list = getStored<GroomingAppointment[]>('petcare_grooming_data_v3', INITIAL_GROOMING);
    const idx = list.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], status };
    setStored('petcare_grooming_data_v3', list);
    return list[idx];
  }
  public static addGrooming(g: Omit<GroomingAppointment, 'id'>): GroomingAppointment {
    const list = getStored<GroomingAppointment[]>('petcare_grooming_data_v3', INITIAL_GROOMING);
    const item: GroomingAppointment = { ...g, id: `grm_${Date.now()}` };
    list.unshift(item);
    setStored('petcare_grooming_data_v3', list);
    return item;
  }
  public static deleteGrooming(id: string): boolean {
    const list = getStored<GroomingAppointment[]>('petcare_grooming_data_v3', INITIAL_GROOMING).filter((g) => g.id !== id);
    setStored('petcare_grooming_data_v3', list);
    return true;
  }

  // Medical Records (Clinical) - OWNERS STRICTLY PROHIBITED
  public static getMedicalRecords(user?: User | null): MedicalRecord[] {
    if (user && user.role === 'owner') {
      return [];
    }
    return getStored<MedicalRecord[]>('petcare_records_data_v3', INITIAL_MEDICAL_RECORDS);
  }
  public static addMedicalRecord(rec: Omit<MedicalRecord, 'id'>, actingRole?: UserRole): MedicalRecord {
    if (actingRole === 'owner' || actingRole === 'staff') {
      throw new Error('Permission Denied: Only Veterinarians and Administrators may record clinical medical records.');
    }
    const list = getStored<MedicalRecord[]>('petcare_records_data_v3', INITIAL_MEDICAL_RECORDS);
    const item: MedicalRecord = { ...rec, id: `rec_${Date.now()}` };
    list.unshift(item);
    setStored('petcare_records_data_v3', list);
    return item;
  }
  public static deleteMedicalRecord(id: string): boolean {
    const list = getStored<MedicalRecord[]>('petcare_records_data_v3', INITIAL_MEDICAL_RECORDS).filter((r) => r.id !== id);
    setStored('petcare_records_data_v3', list);
    return true;
  }

  // Telemetry (Smart Care Monitor)
  public static getTelemetry(user?: User | null): SmartCareTelemetry[] {
    const all = getStored<SmartCareTelemetry[]>('petcare_telemetry_data_v3', INITIAL_TELEMETRY);
    if (user && user.role === 'owner') {
      const myPetIds = new Set(this.getPets(user).map((p) => p.id));
      return all.filter((t) => myPetIds.has(t.petId));
    }
    return all;
  }
  public static simulateTelemetryUpdate(): SmartCareTelemetry[] {
    const list = getStored<SmartCareTelemetry[]>('petcare_telemetry_data_v3', INITIAL_TELEMETRY).map((t) => {
      // Simulate slight, realistic vital sign variations
      const hrDelta = Math.floor(Math.random() * 5) - 2;
      const tempDelta = (Math.random() * 0.4 - 0.2);
      const newHr = Math.max(65, Math.min(150, t.heartRate + hrDelta));
      const newTemp = parseFloat((t.bodyTemp + tempDelta).toFixed(1));
      return {
        ...t,
        heartRate: newHr,
        bodyTemp: Math.max(37.5, Math.min(39.5, newTemp)),
        lastSyncTime: 'Just now (Simulated)',
      };
    });
    setStored('petcare_telemetry_data_v3', list);
    return list;
  }

  // Notifications
  public static getNotifications(user?: User | null): NotificationItem[] {
    const all = getStored<NotificationItem[]>('petcare_notifications_data_v3', INITIAL_NOTIFICATIONS);
    if (user && user.role === 'owner') {
      return all.filter((n) => n.targetRole === 'all' || n.targetRole === 'owner');
    }
    if (user && user.role) {
      return all.filter((n) => n.targetRole === 'all' || n.targetRole === user.role);
    }
    return all;
  }
  public static addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): NotificationItem {
    const list = getStored<NotificationItem[]>('petcare_notifications_data_v3', INITIAL_NOTIFICATIONS);
    const item: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: 'Just now',
      isRead: false,
    };
    list.unshift(item);
    setStored('petcare_notifications_data_v3', list);
    return item;
  }
  public static markNotificationRead(id: string): void {
    const list = getStored<NotificationItem[]>('petcare_notifications_data_v3', INITIAL_NOTIFICATIONS);
    const idx = list.findIndex((n) => n.id === id);
    if (idx !== -1) {
      list[idx].isRead = true;
      setStored('petcare_notifications_data_v3', list);
    }
  }
  public static markAllNotificationsRead(): void {
    const list = getStored<NotificationItem[]>('petcare_notifications_data_v3', INITIAL_NOTIFICATIONS).map((n) => ({ ...n, isRead: true }));
    setStored('petcare_notifications_data_v3', list);
  }
  public static deleteNotification(id: string): boolean {
    const list = getStored<NotificationItem[]>('petcare_notifications_data_v3', INITIAL_NOTIFICATIONS).filter((n) => n.id !== id);
    setStored('petcare_notifications_data_v3', list);
    return true;
  }

  // Invoices & Billing
  public static getInvoices(user?: User | null): Invoice[] {
    const all = getStored<Invoice[]>('petcare_invoices_data_v3', INITIAL_INVOICES);
    if (user && user.role === 'owner') {
      const myPetIds = new Set(this.getPets(user).map((p) => p.id));
      return all.filter((i) => i.ownerId === user.id || myPetIds.has(i.petId));
    }
    return all;
  }
  public static markInvoicePaid(
    id: string,
    paymentMethod: Invoice['paymentMethod'],
    user?: User | null
  ): Invoice | null {
    const list = getStored<Invoice[]>('petcare_invoices_data_v3', INITIAL_INVOICES);
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) return null;

    const invoice = list[idx];
    if (user && user.role === 'owner') {
      const myPetIds = new Set(this.getPets(user).map((p) => p.id));
      if (invoice.ownerId !== user.id && !myPetIds.has(invoice.petId)) {
        throw new Error('Permission Denied: You cannot settle an invoice belonging to another owner.');
      }
      if (invoice.status === 'Paid') {
        throw new Error('This invoice has already been settled.');
      }
    }

    list[idx].status = 'Paid';
    list[idx].paymentMethod = paymentMethod || 'Credit Card';
    setStored('petcare_invoices_data_v3', list);
    return list[idx];
  }
  public static addInvoice(inv: Omit<Invoice, 'id'>): Invoice {
    const list = getStored<Invoice[]>('petcare_invoices_data_v3', INITIAL_INVOICES);
    const item: Invoice = { ...inv, id: `inv_${Date.now()}` };
    list.unshift(item);
    setStored('petcare_invoices_data_v3', list);
    return item;
  }
}
