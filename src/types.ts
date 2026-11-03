export type UserRole = 'admin' | 'doctor' | 'staff' | 'owner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  department?: string;
  specialization?: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other';
  breed: string;
  age: number;
  gender: 'Male' | 'Female';
  weight: number;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  microchipId: string;
  avatarUrl: string;
  allergies?: string[];
  medicalNotes?: string;
  isBoarded: boolean;
  roomNumber?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  petId: string;
  petName: string;
  ownerId: string;
  ownerName: string;
  roomType: 'Standard Kennel' | 'Deluxe Suite' | 'Cat Condo' | 'VIP Penthouse';
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'Confirmed' | 'Checked-In' | 'Completed' | 'Cancelled';
  dailyRate: number;
  specialInstructions?: string;
  emergencyContact: string;
}

export interface FeedingSchedule {
  id: string;
  petId: string;
  petName: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  scheduledTime: string;
  foodBrand: string;
  portionGrams: number;
  dietaryRestrictions: string;
  isCompleted: boolean;
  completedAt?: string;
  staffName?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  petId: string;
  petName: string;
  name: string;
  dosage: string;
  frequency: string;
  route: 'Oral' | 'Topical' | 'Injection' | 'Eye Drops';
  prescribedBy: string;
  startDate: string;
  endDate: string;
  isGivenToday: boolean;
  lastAdministered?: string;
  instructions: string;
}

export interface Vaccination {
  id: string;
  petId: string;
  petName: string;
  vaccineName: string;
  dateAdministered: string;
  dueDate: string;
  batchNumber: string;
  administeredBy: string;
  status: 'Up to Date' | 'Due Soon' | 'Overdue';
  certificateId: string;
}

export interface GroomingAppointment {
  id: string;
  petId: string;
  petName: string;
  ownerName: string;
  services: string[];
  appointmentDate: string;
  appointmentTime: string;
  groomerName: string;
  status: 'Scheduled' | 'In-Progress' | 'Ready for Pickup' | 'Completed';
  price: number;
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  petName: string;
  date: string;
  doctorName: string;
  doctorEmail: string;
  diagnosis: string;
  symptoms: string;
  vitals: {
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    weight: number;
  };
  treatmentPlan: string;
  followUpDate?: string;
}

export interface SmartCareTelemetry {
  petId: string;
  petName: string;
  roomNumber: string;
  status: 'Normal' | 'Alert' | 'Resting';
  heartRate: number;
  bodyTemp: number;
  activityLevel: 'Low' | 'Moderate' | 'High' | 'Sleeping' | 'Resting';
  ambientTemp: number;
  humidity: number;
  lastSyncTime: string;
  cameraStatus: 'Online' | 'Offline';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  targetRole?: UserRole | 'all';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  petId: string;
  petName: string;
  ownerId: string;
  ownerName: string;
  date: string;
  dueDate: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentMethod?: 'Credit Card' | 'Cash' | 'Online Transfer';
}
