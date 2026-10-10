/**
 * Hospital Management System - Data Store & Local Database
 * Provides full state management with persistent LocalStorage support.
 */

class HospitalStore {
  constructor() {
    this.STORAGE_KEY = 'HMS_HOSPITAL_DATA_V1';
    this.currentUser = null;
    this.init();
  }

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) {
      this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
      this.save();
    } else {
      try {
        this.data = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved data, resetting to defaults", e);
        this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
        this.save();
      }
    }
    // Check for existing active logged in session
    const savedUser = localStorage.getItem('HMS_CURRENT_USER');
    const isLoggedIn = localStorage.getItem('HMS_LOGGED_IN') === 'true';
    if (savedUser && isLoggedIn) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {
        this.currentUser = null;
      }
    } else {
      this.currentUser = null;
    }
  }

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  }

  resetToDefault() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.save();
    this.setCurrentUser(this.data.users[0]);
  }

  // --- Auth & Users ---
  setCurrentUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('HMS_CURRENT_USER', JSON.stringify(user));
      localStorage.setItem('HMS_LOGGED_IN', 'true');
    } else {
      localStorage.removeItem('HMS_CURRENT_USER');
      localStorage.removeItem('HMS_LOGGED_IN');
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  login(username, password) {
    const user = this.data.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);
    if (user) {
      this.setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: "Invalid username or password" };
  }

  registerPatient(formData) {
    const existing = this.data.users.find(u => u.username.toLowerCase() === formData.username.trim().toLowerCase());
    if (existing) {
      return { success: false, message: "Username already exists" };
    }

    const newUserId = this.data.users.length ? Math.max(...this.data.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newUserId,
      username: formData.username.trim(),
      password: formData.password,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone || "+1-555-0000",
      role: "ROLE_PATIENT"
    };
    this.data.users.push(newUser);

    const newPatientId = this.data.patients.length ? Math.max(...this.data.patients.map(p => p.id)) + 1 : 1;
    const newPatient = {
      id: newPatientId,
      userId: newUserId,
      name: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone || "",
      dateOfBirth: formData.dateOfBirth || "2000-01-01",
      gender: formData.gender || "Other",
      bloodGroup: formData.bloodGroup || "O+",
      address: formData.address || "",
      emergencyContact: formData.emergencyContact || "",
      medicalHistory: formData.medicalHistory || "None recorded"
    };
    this.data.patients.push(newPatient);

    this.save();
    this.setCurrentUser(newUser);
    return { success: true, user: newUser, patient: newPatient };
  }

  registerDoctor(formData) {
    const existing = this.data.users.find(u => u.username.toLowerCase() === formData.username.trim().toLowerCase());
    if (existing) {
      return { success: false, message: "Username already exists" };
    }

    const newUserId = this.data.users.length ? Math.max(...this.data.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newUserId,
      username: formData.username.trim(),
      password: formData.password,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone || "+1-555-0100",
      role: "ROLE_DOCTOR"
    };
    this.data.users.push(newUser);

    const newDocId = this.data.doctors.length ? Math.max(...this.data.doctors.map(d => d.id)) + 1 : 1;
    const newDoc = {
      id: newDocId,
      userId: newUserId,
      name: formData.fullName.trim(),
      department: formData.department || "General Medicine",
      specialization: formData.specialization || "Clinical Practice",
      qualification: formData.qualification || "MD, MBBS",
      experienceYears: Number(formData.experienceYears) || 5,
      consultationFee: Number(formData.consultationFee) || 120.00,
      availableDays: formData.availableDays || "Mon - Fri",
      availableHours: formData.availableHours || "09:00 AM - 04:00 PM",
      roomNumber: formData.roomNumber || `Opd-${200 + newDocId}`,
      rating: 5.0
    };
    this.data.doctors.push(newDoc);

    this.save();
    this.setCurrentUser(newUser);
    return { success: true, user: newUser, doctor: newDoc };
  }

  // --- Doctors ---
  getAllDoctors() {
    return [...this.data.doctors];
  }

  getDoctorById(id) {
    return this.data.doctors.find(d => d.id === Number(id));
  }

  getDoctorByUserId(userId) {
    return this.data.doctors.find(d => d.userId === Number(userId));
  }

  addDoctor(docData) {
    const newUserId = this.data.users.length ? Math.max(...this.data.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newUserId,
      username: (docData.name.toLowerCase().replace(/[^a-z0-9]/g, '') || "dr.new") + newUserId,
      password: "doctor123",
      fullName: docData.name,
      email: docData.email || `doctor${newUserId}@hospital.com`,
      phone: docData.phone || "+1-555-0199",
      role: "ROLE_DOCTOR"
    };
    this.data.users.push(newUser);

    const newDocId = this.data.doctors.length ? Math.max(...this.data.doctors.map(d => d.id)) + 1 : 1;
    const newDoc = {
      id: newDocId,
      userId: newUserId,
      name: docData.name,
      department: docData.department,
      specialization: docData.specialization,
      qualification: docData.qualification,
      experienceYears: Number(docData.experienceYears) || 5,
      consultationFee: Number(docData.consultationFee) || 100.00,
      availableDays: docData.availableDays || "Mon - Fri",
      availableHours: docData.availableHours || "09:00 AM - 05:00 PM",
      roomNumber: docData.roomNumber || `Opd-${100 + newDocId}`,
      rating: 5.0,
      patientsTreated: 0
    };
    this.data.doctors.push(newDoc);
    this.save();
    return newDoc;
  }

  // --- Patients ---
  getAllPatients() {
    return [...this.data.patients];
  }

  getPatientById(id) {
    return this.data.patients.find(p => p.id === Number(id));
  }

  getPatientByUserId(userId) {
    return this.data.patients.find(p => p.userId === Number(userId));
  }

  updatePatient(id, updated) {
    const index = this.data.patients.findIndex(p => p.id === Number(id));
    if (index !== -1) {
      this.data.patients[index] = { ...this.data.patients[index], ...updated };
      this.save();
      return this.data.patients[index];
    }
    return null;
  }

  // --- Appointments ---
  getAllAppointments() {
    return [...this.data.appointments].sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
  }

  getAppointmentsByPatient(patientId) {
    return this.data.appointments
      .filter(a => a.patientId === Number(patientId))
      .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
  }

  getAppointmentsByDoctor(doctorId) {
    return this.data.appointments
      .filter(a => a.doctorId === Number(doctorId))
      .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
  }

  bookAppointment(req) {
    const doctor = this.getDoctorById(req.doctorId);
    const patient = this.getPatientById(req.patientId);

    if (!doctor || !patient) {
      return { success: false, message: "Invalid doctor or patient ID" };
    }

    const newAppId = this.data.appointments.length ? Math.max(...this.data.appointments.map(a => a.id)) + 1 : 1;
    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newAppointment = {
      id: newAppId,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      appointmentDate: req.appointmentDate,
      appointmentTime: req.appointmentTime,
      reason: req.reason || "General Consultation",
      status: "PENDING",
      doctorNotes: "",
      createdAt
    };

    this.data.appointments.push(newAppointment);

    // Automatically create corresponding invoice bill
    const newBillId = this.data.bills.length ? Math.max(...this.data.bills.map(b => b.id)) + 1 : 1;
    const newBill = {
      id: newBillId,
      appointmentId: newAppId,
      patientId: patient.id,
      patientName: patient.name,
      doctorName: doctor.name,
      consultationFee: doctor.consultationFee,
      additionalCharges: 0.00,
      totalAmount: doctor.consultationFee,
      paymentStatus: "UNPAID",
      paymentMethod: null,
      billingDate: createdAt,
      breakdown: `${doctor.department} Consultation Fee: $${doctor.consultationFee.toFixed(2)}`
    };
    this.data.bills.push(newBill);

    this.save();
    return { success: true, appointment: newAppointment, bill: newBill };
  }

  updateAppointmentStatus(id, status, notes = "") {
    const app = this.data.appointments.find(a => a.id === Number(id));
    if (app) {
      app.status = status;
      if (notes) app.doctorNotes = notes;
      this.save();
      return { success: true, appointment: app };
    }
    return { success: false, message: "Appointment not found" };
  }

  // --- Prescriptions ---
  getAllPrescriptions() {
    return [...this.data.prescriptions].sort((a, b) => new Date(b.dateIssued) - new Date(a.dateIssued));
  }

  getPrescriptionsByPatient(patientId) {
    return this.data.prescriptions.filter(p => p.patientId === Number(patientId));
  }

  getPrescriptionsByDoctor(doctorId) {
    return this.data.prescriptions.filter(p => p.doctorId === Number(doctorId));
  }

  getPrescriptionByAppointment(appointmentId) {
    return this.data.prescriptions.find(p => p.appointmentId === Number(appointmentId));
  }

  addPrescription(req) {
    const appointment = this.data.appointments.find(a => a.id === Number(req.appointmentId));
    if (!appointment) {
      return { success: false, message: "Appointment not found" };
    }

    const doctor = this.getDoctorById(appointment.doctorId);
    const patient = this.getPatientById(appointment.patientId);

    const now = new Date();
    const dateIssued = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const newPrescId = this.data.prescriptions.length ? Math.max(...this.data.prescriptions.map(p => p.id)) + 1 : 1;
    const newPrescription = {
      id: newPrescId,
      appointmentId: appointment.id,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      dateIssued,
      diagnosis: req.diagnosis,
      medicines: req.medicines,
      instructions: req.instructions
    };

    this.data.prescriptions.push(newPrescription);

    // Auto mark appointment as COMPLETED
    appointment.status = "COMPLETED";
    if (req.diagnosis) {
      appointment.doctorNotes = `Diagnosis: ${req.diagnosis}. Prescription issued.`;
    }

    this.save();
    return { success: true, prescription: newPrescription };
  }

  // --- Billing ---
  getAllBills() {
    return [...this.data.bills].sort((a, b) => new Date(b.billingDate) - new Date(a.billingDate));
  }

  getBillsByPatient(patientId) {
    return this.data.bills.filter(b => b.patientId === Number(patientId));
  }

  getBillById(id) {
    return this.data.bills.find(b => b.id === Number(id));
  }

  payBill(billId, paymentMethod = "Credit Card") {
    const bill = this.data.bills.find(b => b.id === Number(billId));
    if (bill) {
      bill.paymentStatus = "PAID";
      bill.paymentMethod = paymentMethod;
      this.save();
      return { success: true, bill };
    }
    return { success: false, message: "Bill not found" };
  }

  // --- Dashboard Stats ---
  getDashboardStats() {
    const totalPatients = this.data.patients.length;
    const totalDoctors = this.data.doctors.length;
    const totalAppointments = this.data.appointments.length;
    const pendingAppointments = this.data.appointments.filter(a => a.status === 'PENDING').length;
    const completedAppointments = this.data.appointments.filter(a => a.status === 'COMPLETED').length;

    const totalRevenue = this.data.bills
      .filter(b => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + Number(b.totalAmount), 0);

    const pendingRevenue = this.data.bills
      .filter(b => b.paymentStatus === 'UNPAID')
      .reduce((sum, b) => sum + Number(b.totalAmount), 0);

    // Department counts for charts
    const deptCounts = {};
    this.data.appointments.forEach(a => {
      deptCounts[a.department] = (deptCounts[a.department] || 0) + 1;
    });

    return {
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      totalRevenue,
      pendingRevenue,
      deptCounts
    };
  }
}

// Global store instance
window.hospitalStore = new HospitalStore();
