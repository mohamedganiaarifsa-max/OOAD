import * as XLSX from 'xlsx';
import {
  Pet,
  Booking,
  FeedingSchedule,
  Medication,
  Vaccination,
  GroomingAppointment,
  MedicalRecord,
  Invoice,
} from '../types';

/**
 * Helper to download an XLSX workbook buffer in browser
 */
function downloadWorkbook(workbook: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(workbook, filename);
}

/**
 * Export a comprehensive multi-tab Excel dossier for a single pet.
 */
export function exportPetExcelReport(params: {
  pet: Pet;
  bookings: Booking[];
  feedings: FeedingSchedule[];
  medications: Medication[];
  vaccinations: Vaccination[];
  groomings: GroomingAppointment[];
  medicalRecords: MedicalRecord[];
  invoices: Invoice[];
}) {
  const { pet, bookings, feedings, medications, vaccinations, groomings, medicalRecords, invoices } = params;
  const wb = XLSX.utils.book_new();

  // 1. Pet Overview Sheet
  const petData = [
    { Field: 'Pet ID', Value: pet.id },
    { Field: 'Pet Name', Value: pet.name },
    { Field: 'Species', Value: pet.species },
    { Field: 'Breed', Value: pet.breed },
    { Field: 'Age (Years)', Value: pet.age },
    { Field: 'Gender', Value: pet.gender },
    { Field: 'Weight (kg)', Value: pet.weight },
    { Field: 'Microchip ID', Value: pet.microchipId },
    { Field: 'Owner Name', Value: pet.ownerName },
    { Field: 'Owner ID', Value: pet.ownerId },
    { Field: 'Owner Contact', Value: pet.ownerPhone || 'N/A' },
    { Field: 'Boarding Status', Value: pet.isBoarded ? `Currently Boarded (${pet.roomNumber || 'Room N/A'})` : 'At Home' },
    { Field: 'Allergies', Value: pet.allergies && pet.allergies.length > 0 ? pet.allergies.join(', ') : 'None Reported' },
    { Field: 'Medical Notes', Value: pet.medicalNotes || 'None' },
    { Field: 'Registration Date', Value: pet.createdAt },
  ];
  const wsPet = XLSX.utils.json_to_sheet(petData);
  XLSX.utils.book_append_sheet(wb, wsPet, 'Pet Profile');

  // 2. Bookings & Boarding Sheet
  const bookingRows = bookings
    .filter((b) => b.petId === pet.id)
    .map((b) => ({
      'Booking ID': b.id,
      'Room Type': b.roomType,
      'Room Number': b.roomNumber,
      'Check-In Date': b.checkInDate,
      'Check-Out Date': b.checkOutDate,
      'Daily Rate (INR)': b.dailyRate,
      'Status': b.status,
      'Emergency Contact': b.emergencyContact,
      'Special Instructions': b.specialInstructions || 'None',
    }));
  const wsBookings = XLSX.utils.json_to_sheet(bookingRows.length > 0 ? bookingRows : [{ Note: 'No boarding records found for this pet' }]);
  XLSX.utils.book_append_sheet(wb, wsBookings, 'Boarding Stays');

  // 3. Feeding Information Sheet
  const feedingRows = feedings
    .filter((f) => f.petId === pet.id)
    .map((f) => ({
      'Feeding ID': f.id,
      'Meal Type': f.mealType,
      'Scheduled Time': f.scheduledTime,
      'Food Brand / Diet': f.foodBrand,
      'Portion (grams)': f.portionGrams,
      'Dietary Restrictions': f.dietaryRestrictions || 'None',
      'Status': f.isCompleted ? 'Completed' : 'Pending',
      'Completed Time': f.completedAt || 'N/A',
      'Served By': f.staffName || 'N/A',
      'Care Notes': f.notes || '',
    }));
  const wsFeeding = XLSX.utils.json_to_sheet(feedingRows.length > 0 ? feedingRows : [{ Note: 'No feeding schedule found' }]);
  XLSX.utils.book_append_sheet(wb, wsFeeding, 'Feeding Schedule');

  // 4. Medications Sheet
  const medRows = medications
    .filter((m) => m.petId === pet.id)
    .map((m) => ({
      'Medication ID': m.id,
      'Medicine Name': m.name,
      'Dosage': m.dosage,
      'Frequency': m.frequency,
      'Route': m.route,
      'Prescribed By': m.prescribedBy,
      'Start Date': m.startDate,
      'End Date': m.endDate,
      'Administered Today': m.isGivenToday ? 'Yes' : 'Pending',
      'Last Administered': m.lastAdministered || 'Not recorded today',
      'Administration Instructions': m.instructions,
    }));
  const wsMeds = XLSX.utils.json_to_sheet(medRows.length > 0 ? medRows : [{ Note: 'No medication prescriptions found' }]);
  XLSX.utils.book_append_sheet(wb, wsMeds, 'Medications');

  // 5. Vaccinations Sheet
  const vacRows = vaccinations
    .filter((v) => v.petId === pet.id)
    .map((v) => ({
      'Certificate ID': v.certificateId,
      'Vaccine Name': v.vaccineName,
      'Batch Number': v.batchNumber,
      'Date Administered': v.dateAdministered,
      'Next Due Date': v.dueDate,
      'Administered By': v.administeredBy,
      'Status': v.status,
    }));
  const wsVac = XLSX.utils.json_to_sheet(vacRows.length > 0 ? vacRows : [{ Note: 'No vaccination records found' }]);
  XLSX.utils.book_append_sheet(wb, wsVac, 'Vaccinations');

  // 6. Grooming Salon Sheet
  const groomRows = groomings
    .filter((g) => g.petId === pet.id)
    .map((g) => ({
      'Appointment ID': g.id,
      'Services': g.services.join(', '),
      'Date': g.appointmentDate,
      'Time': g.appointmentTime,
      'Groomer': g.groomerName,
      'Price (INR)': g.price,
      'Status': g.status,
      'Notes': g.notes || '',
    }));
  const wsGroom = XLSX.utils.json_to_sheet(groomRows.length > 0 ? groomRows : [{ Note: 'No grooming records found' }]);
  XLSX.utils.book_append_sheet(wb, wsGroom, 'Grooming Salon');

  // 7. Clinical Medical Records Sheet
  const medRecRows = medicalRecords
    .filter((r) => r.petId === pet.id)
    .map((r) => ({
      'Record ID': r.id,
      'Consultation Date': r.date,
      'Doctor Name': r.doctorName,
      'Diagnosis': r.diagnosis,
      'Reported Symptoms': r.symptoms,
      'Temp (°C)': r.vitals.temperature,
      'Heart Rate (bpm)': r.vitals.heartRate,
      'Resp. Rate (/min)': r.vitals.respiratoryRate,
      'Weight (kg)': r.vitals.weight,
      'Treatment Plan': r.treatmentPlan,
      'Follow-Up Date': r.followUpDate || 'None',
    }));
  const wsMedRec = XLSX.utils.json_to_sheet(medRecRows.length > 0 ? medRecRows : [{ Note: 'No clinical medical consultations recorded' }]);
  XLSX.utils.book_append_sheet(wb, wsMedRec, 'Medical History');

  // 8. Invoices & Billing Sheet
  const invRows = invoices
    .filter((i) => i.petId === pet.id)
    .map((i) => ({
      'Invoice #': i.invoiceNumber,
      'Billing Date': i.date,
      'Due Date': i.dueDate,
      'Services / Items': i.items.map((it) => `${it.description} (x${it.quantity})`).join('; '),
      'Subtotal (INR)': i.subtotal,
      'GST 18% (INR)': i.tax,
      'Total Amount (INR)': i.total,
      'Payment Status': i.status,
      'Payment Method': i.paymentMethod || 'Unpaid',
    }));
  const wsInv = XLSX.utils.json_to_sheet(invRows.length > 0 ? invRows : [{ Note: 'No invoices found for this pet' }]);
  XLSX.utils.book_append_sheet(wb, wsInv, 'Billing & Invoices');

  const cleanName = pet.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `PetCare_Report_${cleanName}_${dateStr}.xlsx`;

  downloadWorkbook(wb, filename);
}

/**
 * Export consolidated reports for all pets across multiple operational modules.
 */
export function exportAllPetsExcelReport(params: {
  pets: Pet[];
  bookings: Booking[];
  feedings: FeedingSchedule[];
  medications: Medication[];
  vaccinations: Vaccination[];
  groomings: GroomingAppointment[];
  medicalRecords: MedicalRecord[];
  invoices: Invoice[];
}) {
  const { pets, bookings, feedings, medications, vaccinations, groomings, medicalRecords, invoices } = params;
  const wb = XLSX.utils.book_new();

  // All Pets Directory
  const petsSheet = pets.map((p) => ({
    'Pet ID': p.id,
    'Pet Name': p.name,
    'Species': p.species,
    'Breed': p.breed,
    'Age': p.age,
    'Gender': p.gender,
    'Weight (kg)': p.weight,
    'Microchip ID': p.microchipId,
    'Owner Name': p.ownerName,
    'Owner Contact': p.ownerPhone || 'N/A',
    'Boarded': p.isBoarded ? 'Yes' : 'No',
    'Room': p.roomNumber || 'N/A',
    'Allergies': p.allergies && p.allergies.length > 0 ? p.allergies.join(', ') : 'None',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(petsSheet), 'All Registered Pets');

  // All Boarding Stays
  const bookingSheet = bookings.map((b) => ({
    'Booking ID': b.id,
    'Pet ID': b.petId,
    'Pet Name': b.petName,
    'Owner Name': b.ownerName,
    'Room Type': b.roomType,
    'Room Number': b.roomNumber,
    'Check-In': b.checkInDate,
    'Check-Out': b.checkOutDate,
    'Daily Rate (INR)': b.dailyRate,
    'Status': b.status,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bookingSheet), 'Boarding Operations');

  // All Vaccinations
  const vacSheet = vaccinations.map((v) => ({
    'Cert ID': v.certificateId,
    'Pet ID': v.petId,
    'Pet Name': v.petName,
    'Vaccine': v.vaccineName,
    'Batch #': v.batchNumber,
    'Administered Date': v.dateAdministered,
    'Next Due Date': v.dueDate,
    'Doctor / Vet': v.administeredBy,
    'Status': v.status,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(vacSheet), 'Vaccination Registry');

  // All Medications
  const medSheet = medications.map((m) => ({
    'Med ID': m.id,
    'Pet ID': m.petId,
    'Pet Name': m.petName,
    'Medication': m.name,
    'Dosage': m.dosage,
    'Frequency': m.frequency,
    'Route': m.route,
    'Prescribed By': m.prescribedBy,
    'Given Today': m.isGivenToday ? 'Yes' : 'Pending',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(medSheet), 'Active Prescriptions');

  // All Groomings
  const groomSheet = groomings.map((g) => ({
    'Appointment ID': g.id,
    'Pet ID': g.petId,
    'Pet Name': g.petName,
    'Owner': g.ownerName,
    'Services': g.services.join(', '),
    'Date': g.appointmentDate,
    'Groomer': g.groomerName,
    'Price (INR)': g.price,
    'Status': g.status,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(groomSheet), 'Grooming Salon');

  // All Billing & Invoices
  const billingSheet = invoices.map((i) => ({
    'Invoice #': i.invoiceNumber,
    'Pet Name': i.petName,
    'Owner Name': i.ownerName,
    'Date': i.date,
    'Due Date': i.dueDate,
    'Subtotal (INR)': i.subtotal,
    'GST 18% (INR)': i.tax,
    'Total (INR)': i.total,
    'Status': i.status,
    'Method': i.paymentMethod || 'N/A',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(billingSheet), 'Financial Billing');

  const dateStr = new Date().toISOString().split('T')[0];
  downloadWorkbook(wb, `PetCare_Master_Operations_Report_${dateStr}.xlsx`);
}

/**
 * Export specific modular report
 */
export function exportModularExcelReport(moduleType: 'boarding' | 'vaccinations' | 'medications' | 'feeding' | 'grooming' | 'billing', data: any[]) {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().split('T')[0];
  const sheet = XLSX.utils.json_to_sheet(data);
  const titles: Record<string, string> = {
    boarding: 'Boarding Stays',
    vaccinations: 'Vaccinations Registry',
    medications: 'Medication Logs',
    feeding: 'Feeding Schedules',
    grooming: 'Grooming Salon',
    billing: 'Invoices & Billing',
  };
  XLSX.utils.book_append_sheet(wb, sheet, titles[moduleType] || 'Report');
  downloadWorkbook(wb, `PetCare_${moduleType.toUpperCase()}_Report_${dateStr}.xlsx`);
}
