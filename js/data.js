/**
 * Hospital Management System - Initial Seed Data
 * Contains pre-populated Doctors, Patients, Appointments, Prescriptions, and Billing records.
 */

const INITIAL_DATA = {
  users: [
    { id: 1, username: "admin", password: "admin123", fullName: "Chief Administrator", email: "admin@hospital.com", phone: "+1-555-0100", role: "ROLE_ADMIN" },
    { id: 2, username: "dr.sarah", password: "doctor123", fullName: "Dr. Sarah Johnson", email: "sarah.j@hospital.com", phone: "+1-555-0101", role: "ROLE_DOCTOR" },
    { id: 3, username: "dr.chen", password: "doctor123", fullName: "Dr. David Chen", email: "david.c@hospital.com", phone: "+1-555-0102", role: "ROLE_DOCTOR" },
    { id: 4, username: "dr.emily", password: "doctor123", fullName: "Dr. Emily Rodriguez", email: "emily.r@hospital.com", phone: "+1-555-0103", role: "ROLE_DOCTOR" },
    { id: 5, username: "dr.williams", password: "doctor123", fullName: "Dr. Robert Williams", email: "robert.w@hospital.com", phone: "+1-555-0104", role: "ROLE_DOCTOR" },
    { id: 6, username: "john.doe", password: "patient123", fullName: "John Doe", email: "john.doe@email.com", phone: "+1-555-0201", role: "ROLE_PATIENT" },
    { id: 7, username: "jane.smith", password: "patient123", fullName: "Jane Smith", email: "jane.smith@email.com", phone: "+1-555-0202", role: "ROLE_PATIENT" },
    { id: 8, username: "michael.brown", password: "patient123", fullName: "Michael Brown", email: "michael.b@email.com", phone: "+1-555-0203", role: "ROLE_PATIENT" }
  ],
  doctors: [
    { id: 1, userId: 2, name: "Dr. Sarah Johnson", department: "Cardiology", specialization: "Cardiovascular Disease & Echocardiography", qualification: "MD, FACC - Harvard Medical School", experienceYears: 12, consultationFee: 150.00, availableDays: "Mon - Fri", availableHours: "09:00 AM - 04:00 PM", roomNumber: "Opd-301", rating: 4.9, patientsTreated: 1240 },
    { id: 2, userId: 3, name: "Dr. David Chen", department: "Neurology", specialization: "Clinical Neurophysiology & Stroke Care", qualification: "MD, PhD - Johns Hopkins University", experienceYears: 10, consultationFee: 180.00, availableDays: "Mon - Thu", availableHours: "10:00 AM - 05:00 PM", roomNumber: "Opd-205", rating: 4.8, patientsTreated: 980 },
    { id: 3, userId: 4, name: "Dr. Emily Rodriguez", department: "Pediatrics", specialization: "Child Healthcare & Pediatric Allergy", qualification: "MD Pediatrics - Stanford University", experienceYears: 8, consultationFee: 120.00, availableDays: "Tue - Sat", availableHours: "08:30 AM - 03:30 PM", roomNumber: "Opd-104", rating: 4.95, patientsTreated: 1500 },
    { id: 4, userId: 5, name: "Dr. Robert Williams", department: "Orthopedics", specialization: "Joint Replacement & Sports Medicine", qualification: "MS, FRCS - Oxford University", experienceYears: 15, consultationFee: 160.00, availableDays: "Mon - Fri", availableHours: "09:00 AM - 04:30 PM", roomNumber: "Opd-402", rating: 4.85, patientsTreated: 1820 }
  ],
  patients: [
    { id: 1, userId: 6, name: "John Doe", email: "john.doe@email.com", phone: "+1-555-0201", dateOfBirth: "1988-05-14", gender: "Male", bloodGroup: "O+", address: "742 Evergreen Terrace, Springfield", emergencyContact: "+1-555-9988 (Brother: Mark Doe)", medicalHistory: "Mild hypertension, seasonal pollen allergies. No surgical history." },
    { id: 2, userId: 7, name: "Jane Smith", email: "jane.smith@email.com", phone: "+1-555-0202", dateOfBirth: "1994-08-22", gender: "Female", bloodGroup: "A+", address: "432 Park Avenue, New York", emergencyContact: "+1-555-7766 (Mother: Mary Smith)", medicalHistory: "Migraine headaches with aura. Sensitive to Penicillin." },
    { id: 3, userId: 8, name: "Michael Brown", email: "michael.b@email.com", phone: "+1-555-0203", dateOfBirth: "2001-11-03", gender: "Male", bloodGroup: "B+", address: "120 Elm Street, Chicago", emergencyContact: "+1-555-4433 (Father: Thomas Brown)", medicalHistory: "No prior chronic illnesses. Vaccinations up to date." }
  ],
  appointments: [
    { id: 1, patientId: 2, patientName: "Jane Smith", doctorId: 2, doctorName: "Dr. David Chen", department: "Neurology", appointmentDate: "2026-10-08", appointmentTime: "10:30 AM", reason: "Persistent migraine episodes and visual aura symptoms", status: "COMPLETED", doctorNotes: "Patient reported recurring throbbing headaches for 3 weeks. Neurological exam normal. Prescribed preventive therapy.", createdAt: "2026-10-06 09:15" },
    { id: 2, patientId: 1, patientName: "John Doe", doctorId: 1, doctorName: "Dr. Sarah Johnson", department: "Cardiology", appointmentDate: "2026-10-11", appointmentTime: "09:30 AM", reason: "Routine cardiovascular checkup & blood pressure review", status: "APPROVED", doctorNotes: "Confirmed. Recommended fasting lipid profile prior to consultation.", createdAt: "2026-10-08 14:20" },
    { id: 3, patientId: 3, patientName: "Michael Brown", doctorId: 3, doctorName: "Dr. Emily Rodriguez", department: "Pediatrics", appointmentDate: "2026-10-12", appointmentTime: "11:00 AM", reason: "Seasonal dry cough, mild fever and throat irritation", status: "PENDING", doctorNotes: "", createdAt: "2026-10-09 16:45" },
    { id: 4, patientId: 1, patientName: "John Doe", doctorId: 4, doctorName: "Dr. Robert Williams", department: "Orthopedics", appointmentDate: "2026-10-05", appointmentTime: "02:00 PM", reason: "Right knee ligament stiffness following weekend basketball", status: "COMPLETED", doctorNotes: "Grade 1 MCL strain observed on physical test. Rest, ice compression, and knee brace recommended.", createdAt: "2026-10-03 11:10" }
  ],
  prescriptions: [
    { id: 1, appointmentId: 1, patientId: 2, patientName: "Jane Smith", doctorId: 2, doctorName: "Dr. David Chen", department: "Neurology", dateIssued: "2026-10-08", diagnosis: "Chronic Migraine with Visual Aura (ICD-10 G43.1)", medicines: "1. Sumatriptan 50mg - Take 1 tablet at headache onset (Max 200mg/day)\n2. Propranolol 40mg - 1 tablet once daily morning\n3. Magnesium Glycinate 400mg - 1 capsule nightly before sleep", instructions: "Maintain a daily headache journal. Avoid caffeine drinks after 3 PM. Ensure 7-8 hours sleep. Follow up in 4 weeks." },
    { id: 2, appointmentId: 4, patientId: 1, patientName: "John Doe", doctorId: 4, doctorName: "Dr. Robert Williams", department: "Orthopedics", dateIssued: "2026-10-05", diagnosis: "Medial Collateral Ligament (MCL) Strain - Grade 1", medicines: "1. Ibuprofen 400mg - 1 tablet 3 times daily after food for 5 days\n2. Paracetamol 500mg - 1 tablet as needed for severe discomfort\n3. Diclofenac Gel 1% - Apply locally twice daily", instructions: "Apply ice pack for 15 mins every 4 hours. Wear elastic knee sleeve when moving. Refrain from high impact sports for 14 days." }
  ],
  bills: [
    { id: 1, appointmentId: 1, patientId: 2, patientName: "Jane Smith", doctorName: "Dr. David Chen", consultationFee: 180.00, additionalCharges: 45.00, totalAmount: 225.00, paymentStatus: "PAID", paymentMethod: "Credit Card (Visa ending in 8842)", billingDate: "2026-10-08 11:15", breakdown: "Consultation Fee: $180.00 | Neurological Reflex Assessment: $45.00" },
    { id: 2, appointmentId: 2, patientId: 1, patientName: "John Doe", doctorName: "Dr. Sarah Johnson", consultationFee: 150.00, additionalCharges: 0.00, totalAmount: 150.00, paymentStatus: "UNPAID", paymentMethod: null, billingDate: "2026-10-08 14:20", breakdown: "Cardiology Specialist Consultation: $150.00" },
    { id: 3, appointmentId: 3, patientId: 3, patientName: "Michael Brown", doctorName: "Dr. Emily Rodriguez", consultationFee: 120.00, additionalCharges: 0.00, totalAmount: 120.00, paymentStatus: "UNPAID", paymentMethod: null, billingDate: "2026-10-09 16:45", breakdown: "Pediatric Consultation: $120.00" },
    { id: 4, appointmentId: 4, patientId: 1, patientName: "John Doe", doctorName: "Dr. Robert Williams", consultationFee: 160.00, additionalCharges: 35.00, totalAmount: 195.00, paymentStatus: "PAID", paymentMethod: "UPI / Online Payment", billingDate: "2026-10-05 14:40", breakdown: "Consultation Fee: $160.00 | Orthopedic Knee Joint Taping & Brace: $35.00" }
  ]
};
