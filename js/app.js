/**
 * Hospital Management System - Main Application Logic
 * Implements interactive controllers for Patients, Doctors, Admin, and Appointments.
 */

document.addEventListener("DOMContentLoaded", () => {
  HMSApp.init();
});

const HMSApp = {
  currentTab: 'home',
  chartInstance: null,

  init() {
    this.bindEvents();
    this.updateUserInterface();
    this.renderHomeDoctors();
    this.renderDoctorSelectOptions();

    // Check URL parameters for direct portal routing (e.g., from login/register redirect)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const portal = urlParams.get('portal');
      if (portal) {
        if (portal === 'patient') this.switchTab('patient-portal');
        else if (portal === 'doctor') this.switchTab('doctor-portal');
        else if (portal === 'admin') this.switchTab('admin-portal');
        else this.switchTab(portal);
      }
    } catch (e) {}
  },

  logout() {
    localStorage.removeItem('HMS_CURRENT_USER');
    window.location.href = 'login.html';
  },

  // ------------------- UI State & Event Binding -------------------
  bindEvents() {
    // Nav tabs
    document.querySelectorAll('.nav-switch').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = el.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Search doctors on Home
    const docSearchInput = document.getElementById('homeDoctorSearch');
    if (docSearchInput) {
      docSearchInput.addEventListener('input', (e) => {
        this.renderHomeDoctors(e.target.value);
      });
    }

    // Department filter on Home
    const deptFilter = document.getElementById('homeDeptFilter');
    if (deptFilter) {
      deptFilter.addEventListener('change', (e) => {
        this.renderHomeDoctors(docSearchInput ? docSearchInput.value : '', e.target.value);
      });
    }

    // Book appointment form submit
    const bookForm = document.getElementById('bookAppointmentForm');
    if (bookForm) {
      bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleBookAppointment();
      });
    }

    // Prescription form submit
    const prescForm = document.getElementById('issuePrescriptionForm');
    if (prescForm) {
      prescForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleIssuePrescription();
      });
    }

    // Add Doctor form submit (Admin)
    const addDoctorForm = document.getElementById('addDoctorForm');
    if (addDoctorForm) {
      addDoctorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddDoctor();
      });
    }

    // Login Form submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Register Form submit
    const regForm = document.getElementById('registerForm');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }
  },

  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll('.app-page-view').forEach(view => {
      view.classList.add('d-none');
    });

    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) {
      targetView.classList.remove('d-none');
    }

    // Update nav active classes
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-tab') === tabId) {
        link.classList.add('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Render portal-specific views
    if (tabId === 'patient-portal') this.renderPatientPortal();
    if (tabId === 'doctor-portal') this.renderDoctorPortal();
    if (tabId === 'admin-portal') this.renderAdminPortal();
  },

  updateUserInterface() {
    const user = hospitalStore.getCurrentUser();
    const userBadge = document.getElementById('currentUserDisplay');
    const userRolePill = document.getElementById('currentUserRolePill');
    const userAvatar = document.getElementById('navUserAvatar');

    if (user && userBadge) {
      userBadge.textContent = user.fullName;
      const rolePretty = user.role.replace('ROLE_', '');
      userRolePill.textContent = rolePretty;

      // Color code roles
      if (user.role === 'ROLE_ADMIN') {
        userRolePill.className = 'badge bg-danger text-uppercase';
        userAvatar.className = 'rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold';
      } else if (user.role === 'ROLE_DOCTOR') {
        userRolePill.className = 'badge bg-success text-uppercase';
        userAvatar.className = 'rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold';
      } else {
        userRolePill.className = 'badge bg-primary text-uppercase';
        userAvatar.className = 'rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold';
      }
      userAvatar.textContent = user.fullName.charAt(0);
      userAvatar.style.width = '34px';
      userAvatar.style.height = '34px';
    }

    // Update demo chip highlight
    document.querySelectorAll('.demo-chip').forEach(chip => {
      const targetUser = chip.getAttribute('data-user');
      if (user && user.username === targetUser) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    // Refresh current open portal if active
    if (this.currentTab === 'patient-portal') this.renderPatientPortal();
    if (this.currentTab === 'doctor-portal') this.renderDoctorPortal();
    if (this.currentTab === 'admin-portal') this.renderAdminPortal();
  },

  // ------------------- Quick Demo Login Switcher -------------------
  quickLogin(username, password) {
    const res = hospitalStore.login(username, password);
    if (res.success) {
      this.showToast(`Switched account to: ${res.user.fullName} (${res.user.role.replace('ROLE_', '')})`, 'success');
      this.updateUserInterface();

      // Automatically route to appropriate portal
      if (res.user.role === 'ROLE_ADMIN') {
        this.switchTab('admin-portal');
      } else if (res.user.role === 'ROLE_DOCTOR') {
        this.switchTab('doctor-portal');
      } else {
        this.switchTab('patient-portal');
      }
    } else {
      this.showToast(res.message, 'danger');
    }
  },

  async handleLogin() {
    const u = document.getElementById('loginUsername').value.trim();
    const p = document.getElementById('loginPassword').value;
    const res = await HospitalAPI.login(u, p);
    if (res && res.success) {
      this.showToast(`Welcome back, ${res.user.fullName}!`, 'success');
      const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
      if (modal) modal.hide();
      this.updateUserInterface();
      if (res.user.role === 'ROLE_ADMIN') this.switchTab('admin-portal');
      else if (res.user.role === 'ROLE_DOCTOR') this.switchTab('doctor-portal');
      else this.switchTab('patient-portal');
    } else {
      this.showToast((res && res.message) || 'Login failed', 'danger');
    }
  },

  async handleRegister() {
    const formData = {
      username: document.getElementById('regUsername').value.trim(),
      password: document.getElementById('regPassword').value,
      fullName: document.getElementById('regFullName').value.trim(),
      email: document.getElementById('regEmail').value.trim(),
      phone: document.getElementById('regPhone').value.trim(),
      dateOfBirth: document.getElementById('regDob').value,
      gender: document.getElementById('regGender').value,
      bloodGroup: document.getElementById('regBloodGroup').value,
      address: document.getElementById('regAddress').value.trim(),
      emergencyContact: document.getElementById('regEmergencyContact').value.trim(),
      medicalHistory: document.getElementById('regMedicalHistory').value.trim()
    };

    const res = await HospitalAPI.register(formData);
    if (res && res.success) {
      this.showToast('Registration successful! Welcome to ApexCare Hospital.', 'success');
      const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
      if (modal) modal.hide();
      this.updateUserInterface();
      this.switchTab('patient-portal');
    } else {
      this.showToast((res && res.message) || 'Registration failed', 'danger');
    }
  },

  // ------------------- Home / Doctor Directory -------------------
  renderHomeDoctors(searchKeyword = '', deptFilter = '') {
    const container = document.getElementById('homeDoctorsGrid');
    if (!container) return;

    let doctors = hospitalStore.getAllDoctors();

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      doctors = doctors.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.department.toLowerCase().includes(q) || 
        d.specialization.toLowerCase().includes(q)
      );
    }

    if (deptFilter && deptFilter !== 'ALL') {
      doctors = doctors.filter(d => d.department.toLowerCase() === deptFilter.toLowerCase());
    }

    if (doctors.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fa-solid fa-user-doctor text-muted fs-1 mb-3"></i>
          <p class="text-muted fw-semibold">No medical specialists found matching your search.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = doctors.map(doc => `
      <div class="col-md-6 col-lg-3">
        <div class="doctor-card h-100 shadow-sm p-4 d-flex flex-column justify-content-between">
          <div class="doctor-card-header"></div>
          <div>
            <div class="d-flex align-items-center mb-3">
              <div class="doctor-avatar-circle">
                ${doc.name.replace('Dr. ', '').charAt(0)}
              </div>
              <div>
                <span class="badge bg-primary-subtle text-primary mb-1">${doc.department}</span>
                <h5 class="fw-bold mb-0 text-dark">${doc.name}</h5>
                <small class="text-muted d-block">${doc.qualification}</small>
              </div>
            </div>
            <p class="text-muted small mb-3">
              <i class="fa-solid fa-stethoscope text-primary me-1"></i> ${doc.specialization}
            </p>
            <div class="bg-light p-2 rounded-3 small mb-3">
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted"><i class="fa-regular fa-clock me-1"></i> Timings:</span>
                <span class="fw-semibold">${doc.availableHours}</span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted"><i class="fa-regular fa-calendar me-1"></i> Days:</span>
                <span class="fw-semibold">${doc.availableDays}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted"><i class="fa-solid fa-door-open me-1"></i> Room:</span>
                <span class="fw-semibold">${doc.roomNumber}</span>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center pt-2 border-top">
            <div>
              <span class="text-muted small d-block">Consultation Fee</span>
              <span class="fs-5 fw-bold text-dark">$${doc.consultationFee.toFixed(2)}</span>
            </div>
            <button class="btn btn-primary btn-sm px-3" onclick="HMSApp.openBookModal(${doc.id})">
              <i class="fa-regular fa-calendar-check me-1"></i> Book Now
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  renderDoctorSelectOptions() {
    const select = document.getElementById('bookDoctorSelect');
    if (!select) return;
    const docs = hospitalStore.getAllDoctors();
    select.innerHTML = '<option value="">-- Choose Specialist Doctor --</option>' + 
      docs.map(d => `<option value="${d.id}" data-fee="${d.consultationFee}">${d.name} (${d.department}) - Fee: $${d.consultationFee.toFixed(2)}</option>`).join('');

    select.addEventListener('change', (e) => {
      const selected = select.options[select.selectedIndex];
      const fee = selected.getAttribute('data-fee');
      const feeDisplay = document.getElementById('bookingFeeDisplay');
      if (feeDisplay) {
        feeDisplay.textContent = fee ? `$${parseFloat(fee).toFixed(2)}` : '$0.00';
      }
    });
  },

  openBookModal(preselectedDoctorId = null) {
    const user = hospitalStore.getCurrentUser();
    if (!user) {
      this.showToast('Please sign in or select a demo user to book an appointment', 'warning');
      const authModal = new bootstrap.Modal(document.getElementById('authModal'));
      authModal.show();
      return;
    }

    const modalEl = document.getElementById('bookAppointmentModal');
    const modal = new bootstrap.Modal(modalEl);

    if (preselectedDoctorId) {
      const docSelect = document.getElementById('bookDoctorSelect');
      if (docSelect) {
        docSelect.value = preselectedDoctorId;
        docSelect.dispatchEvent(new Event('change'));
      }
    }

    // Set minimum date to tomorrow
    const dateInput = document.getElementById('bookDateInput');
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.min = tomorrow.toISOString().split('T')[0];
      dateInput.value = tomorrow.toISOString().split('T')[0];
    }

    modal.show();
  },

  handleBookAppointment() {
    const user = hospitalStore.getCurrentUser();
    if (!user) return;

    let patient = hospitalStore.getPatientByUserId(user.id);
    if (!patient) {
      // If Admin or Doctor is testing booking, automatically use Patient #1 (John Doe)
      patient = hospitalStore.data.patients[0];
    }

    const doctorId = document.getElementById('bookDoctorSelect').value;
    const appDate = document.getElementById('bookDateInput').value;
    const appTime = document.getElementById('bookTimeSelect').value;
    const reason = document.getElementById('bookReasonInput').value;

    if (!doctorId || !appDate || !appTime) {
      this.showToast('Please select doctor, date and preferred time slot.', 'warning');
      return;
    }

    const result = hospitalStore.bookAppointment({
      patientId: patient.id,
      doctorId: Number(doctorId),
      appointmentDate: appDate,
      appointmentTime: appTime,
      reason: reason || "Health Checkup"
    });

    if (result.success) {
      this.showToast(`Appointment successfully booked with ${result.appointment.doctorName}! Invoice generated.`, 'success');
      const modal = bootstrap.Modal.getInstance(document.getElementById('bookAppointmentModal'));
      if (modal) modal.hide();

      document.getElementById('bookAppointmentForm').reset();
      this.renderPatientPortal();
      this.renderDoctorPortal();
      this.renderAdminPortal();
    } else {
      this.showToast(result.message, 'danger');
    }
  },

  // ------------------- Patient Portal -------------------
  renderPatientPortal() {
    const user = hospitalStore.getCurrentUser();
    let patient = null;

    if (user && user.role === 'ROLE_PATIENT') {
      patient = hospitalStore.getPatientByUserId(user.id);
    }

    // If logged in as admin or doctor viewing patient portal, fallback to first patient for preview
    if (!patient) {
      patient = hospitalStore.data.patients[0];
    }

    // Update patient profile card
    document.getElementById('patientCardName').textContent = patient.name;
    document.getElementById('patientCardEmail').textContent = patient.email;
    document.getElementById('patientCardPhone').textContent = patient.phone;
    document.getElementById('patientCardBlood').textContent = patient.bloodGroup;
    document.getElementById('patientCardDob').textContent = patient.dateOfBirth;
    document.getElementById('patientCardGender').textContent = patient.gender;
    document.getElementById('patientCardEmergency').textContent = patient.emergencyContact;
    document.getElementById('patientCardHistory').textContent = patient.medicalHistory;

    // Render Patient Appointments
    const appointments = hospitalStore.getAppointmentsByPatient(patient.id);
    const appTable = document.getElementById('patientAppointmentsTableBody');
    if (appTable) {
      if (appointments.length === 0) {
        appTable.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No appointments booked yet.</td></tr>`;
      } else {
        appTable.innerHTML = appointments.map(a => `
          <tr>
            <td class="fw-bold">#APP-${a.id}</td>
            <td>
              <div class="fw-semibold text-dark">${a.doctorName}</div>
              <small class="text-muted">${a.department}</small>
            </td>
            <td>
              <div><i class="fa-regular fa-calendar text-primary me-1"></i> ${a.appointmentDate}</div>
              <small class="text-muted"><i class="fa-regular fa-clock me-1"></i> ${a.appointmentTime}</small>
            </td>
            <td><span class="badge-status badge-${a.status.toLowerCase()}">${a.status}</span></td>
            <td><span class="text-truncate d-inline-block" style="max-width: 180px;">${a.reason}</span></td>
            <td>
              ${a.status === 'COMPLETED' ? `
                <button class="btn btn-outline-primary btn-sm py-1 px-2" onclick="HMSApp.viewPrescriptionByAppointment(${a.id})">
                  <i class="fa-solid fa-file-prescription me-1"></i> Prescription
                </button>
              ` : `
                <button class="btn btn-light btn-sm text-danger py-1 px-2" onclick="HMSApp.cancelAppointment(${a.id})" ${a.status === 'CANCELLED' ? 'disabled' : ''}>
                  <i class="fa-solid fa-ban me-1"></i> Cancel
                </button>
              `}
            </td>
          </tr>
        `).join('');
      }
    }

    // Render Patient Prescriptions
    const prescriptions = hospitalStore.getPrescriptionsByPatient(patient.id);
    const prescContainer = document.getElementById('patientPrescriptionsList');
    if (prescContainer) {
      if (prescriptions.length === 0) {
        prescContainer.innerHTML = `<div class="p-4 text-center text-muted">No medical prescriptions issued yet.</div>`;
      } else {
        prescContainer.innerHTML = prescriptions.map(p => `
          <div class="border rounded-3 p-3 mb-3 bg-white shadow-sm hover-shadow transition">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="badge bg-primary-subtle text-primary mb-1">${p.department}</span>
                <h6 class="fw-bold mb-0 text-dark">${p.diagnosis}</h6>
                <small class="text-muted">Prescribed by ${p.doctorName} on ${p.dateIssued}</small>
              </div>
              <button class="btn btn-outline-custom btn-sm" onclick="HMSApp.openPrescriptionModal(${p.id})">
                <i class="fa-solid fa-eye me-1"></i> View & Print Rx
              </button>
            </div>
            <div class="bg-light p-2 rounded-2 small text-secondary font-monospace" style="white-space: pre-line;">
              ${p.medicines}
            </div>
          </div>
        `).join('');
      }
    }

    // Render Patient Bills
    const bills = hospitalStore.getBillsByPatient(patient.id);
    const billsTable = document.getElementById('patientBillsTableBody');
    if (billsTable) {
      if (bills.length === 0) {
        billsTable.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No invoices generated.</td></tr>`;
      } else {
        billsTable.innerHTML = bills.map(b => `
          <tr>
            <td class="fw-bold">#INV-${b.id}</td>
            <td>
              <div class="fw-semibold">${b.doctorName}</div>
              <small class="text-muted">${b.billingDate}</small>
            </td>
            <td class="small text-muted">${b.breakdown || 'Consultation fee'}</td>
            <td class="fw-bold fs-6 text-dark">$${b.totalAmount.toFixed(2)}</td>
            <td>
              <span class="badge-status badge-${b.paymentStatus.toLowerCase()}">${b.paymentStatus}</span>
              ${b.paymentMethod ? `<small class="d-block text-muted">${b.paymentMethod}</small>` : ''}
            </td>
            <td>
              ${b.paymentStatus === 'UNPAID' ? `
                <button class="btn btn-success btn-sm py-1 px-3" onclick="HMSApp.openPayBillModal(${b.id})">
                  <i class="fa-solid fa-credit-card me-1"></i> Pay Now
                </button>
              ` : `
                <button class="btn btn-outline-secondary btn-sm py-1 px-2" onclick="HMSApp.printInvoice(${b.id})">
                  <i class="fa-solid fa-receipt me-1"></i> Receipt
                </button>
              `}
            </td>
          </tr>
        `).join('');
      }
    }
  },

  // ------------------- Doctor Portal -------------------
  renderDoctorPortal() {
    const user = hospitalStore.getCurrentUser();
    let currentDoctor = null;

    if (user && user.role === 'ROLE_DOCTOR') {
      currentDoctor = hospitalStore.getDoctorByUserId(user.id);
    }
    // If Admin is previewing doctor portal, select Doctor #1 (Dr. Sarah Johnson)
    if (!currentDoctor) {
      currentDoctor = hospitalStore.data.doctors[0];
    }

    // Doctor profile header
    document.getElementById('doctorCardName').textContent = currentDoctor.name;
    document.getElementById('doctorCardDept').textContent = currentDoctor.department;
    document.getElementById('doctorCardQual').textContent = currentDoctor.qualification;
    document.getElementById('doctorCardExp').textContent = `${currentDoctor.experienceYears} Years Exp`;
    document.getElementById('doctorCardHours').textContent = currentDoctor.availableHours;
    document.getElementById('doctorCardRoom').textContent = currentDoctor.roomNumber;

    // Doctor Appointments List
    const doctorAppointments = hospitalStore.getAppointmentsByDoctor(currentDoctor.id);
    const container = document.getElementById('doctorAppointmentsTableBody');

    // Calculate quick stats
    const todayAppointments = doctorAppointments.length;
    const pendingCount = doctorAppointments.filter(a => a.status === 'PENDING').length;
    const completedCount = doctorAppointments.filter(a => a.status === 'COMPLETED').length;

    document.getElementById('docStatTotal').textContent = todayAppointments;
    document.getElementById('docStatPending').textContent = pendingCount;
    document.getElementById('docStatCompleted').textContent = completedCount;

    if (container) {
      if (doctorAppointments.length === 0) {
        container.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No appointments assigned to your schedule.</td></tr>`;
      } else {
        container.innerHTML = doctorAppointments.map(a => `
          <tr>
            <td class="fw-bold">#APP-${a.id}</td>
            <td>
              <div class="fw-bold text-dark">${a.patientName}</div>
              <small class="text-muted"><i class="fa-solid fa-notes-medical me-1"></i> ${a.reason}</small>
            </td>
            <td>
              <div><i class="fa-regular fa-calendar text-primary me-1"></i> ${a.appointmentDate}</div>
              <small class="text-muted"><i class="fa-regular fa-clock me-1"></i> ${a.appointmentTime}</small>
            </td>
            <td><span class="badge-status badge-${a.status.toLowerCase()}">${a.status}</span></td>
            <td><small class="text-secondary">${a.doctorNotes || 'No notes added'}</small></td>
            <td>
              <div class="btn-group btn-group-sm">
                ${a.status === 'PENDING' ? `
                  <button class="btn btn-outline-success" title="Approve" onclick="HMSApp.updateAppointmentStatus(${a.id}, 'APPROVED')">
                    <i class="fa-solid fa-check"></i> Approve
                  </button>
                  <button class="btn btn-outline-danger" title="Cancel" onclick="HMSApp.updateAppointmentStatus(${a.id}, 'CANCELLED')">
                    <i class="fa-solid fa-xmark"></i> Reject
                  </button>
                ` : ''}

                ${a.status === 'APPROVED' ? `
                  <button class="btn btn-primary" title="Issue Prescription" onclick="HMSApp.openIssuePrescriptionModal(${a.id})">
                    <i class="fa-solid fa-file-prescription me-1"></i> Write Rx
                  </button>
                ` : ''}

                ${a.status === 'COMPLETED' ? `
                  <button class="btn btn-outline-primary" title="View Prescription" onclick="HMSApp.viewPrescriptionByAppointment(${a.id})">
                    <i class="fa-solid fa-eye me-1"></i> View Rx
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `).join('');
      }
    }
  },

  updateAppointmentStatus(appointmentId, status) {
    const res = hospitalStore.updateAppointmentStatus(appointmentId, status);
    if (res.success) {
      this.showToast(`Appointment status updated to ${status}.`, 'info');
      this.renderDoctorPortal();
      this.renderPatientPortal();
      this.renderAdminPortal();
    }
  },

  cancelAppointment(appointmentId) {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      this.updateAppointmentStatus(appointmentId, 'CANCELLED');
    }
  },

  // ------------------- Admin Portal -------------------
  renderAdminPortal() {
    const stats = hospitalStore.getDashboardStats();

    document.getElementById('adminStatPatients').textContent = stats.totalPatients;
    document.getElementById('adminStatDoctors').textContent = stats.totalDoctors;
    document.getElementById('adminStatAppointments').textContent = stats.totalAppointments;
    document.getElementById('adminStatCompleted').textContent = stats.completedAppointments;
    document.getElementById('adminStatRevenue').textContent = `$${stats.totalRevenue.toLocaleString()}`;
    document.getElementById('adminStatPendingRev').textContent = `$${stats.pendingRevenue.toLocaleString()}`;

    // Render Department Analytics Chart
    this.renderAdminChart(stats.deptCounts);

    // Render Admin Doctors List
    const docs = hospitalStore.getAllDoctors();
    const docTable = document.getElementById('adminDoctorsTableBody');
    if (docTable) {
      docTable.innerHTML = docs.map(d => `
        <tr>
          <td class="fw-bold">#DOC-${d.id}</td>
          <td>
            <div class="fw-bold text-dark">${d.name}</div>
            <small class="text-muted">${d.qualification}</small>
          </td>
          <td><span class="badge bg-primary-subtle text-primary">${d.department}</span></td>
          <td>${d.specialization}</td>
          <td class="fw-bold text-dark">$${d.consultationFee.toFixed(2)}</td>
          <td><small class="text-muted">${d.availableDays} (${d.availableHours})</small></td>
        </tr>
      `).join('');
    }

    // Render Admin Patients List
    const patients = hospitalStore.getAllPatients();
    const patTable = document.getElementById('adminPatientsTableBody');
    if (patTable) {
      patTable.innerHTML = patients.map(p => `
        <tr>
          <td class="fw-bold">#PAT-${p.id}</td>
          <td class="fw-bold text-dark">${p.name}</td>
          <td>${p.gender} / ${p.bloodGroup}</td>
          <td>
            <div>${p.phone}</div>
            <small class="text-muted">${p.email}</small>
          </td>
          <td class="small text-muted">${p.address}</td>
          <td class="small text-truncate" style="max-width: 220px;">${p.medicalHistory}</td>
        </tr>
      `).join('');
    }

    // Render Admin Master Appointments List
    const allApps = hospitalStore.getAllAppointments();
    const allAppsTable = document.getElementById('adminAppointmentsTableBody');
    if (allAppsTable) {
      allAppsTable.innerHTML = allApps.map(a => `
        <tr>
          <td class="fw-bold">#APP-${a.id}</td>
          <td>${a.patientName}</td>
          <td>
            <div>${a.doctorName}</div>
            <small class="text-muted">${a.department}</small>
          </td>
          <td>${a.appointmentDate} <small class="text-muted">(${a.appointmentTime})</small></td>
          <td><span class="badge-status badge-${a.status.toLowerCase()}">${a.status}</span></td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-success btn-sm" onclick="HMSApp.updateAppointmentStatus(${a.id}, 'APPROVED')" title="Approve">
                <i class="fa-solid fa-check"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm" onclick="HMSApp.updateAppointmentStatus(${a.id}, 'CANCELLED')" title="Cancel">
                <i class="fa-solid fa-ban"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    // Render Admin Master Bills List
    const allBills = hospitalStore.getAllBills();
    const allBillsTable = document.getElementById('adminBillsTableBody');
    if (allBillsTable) {
      allBillsTable.innerHTML = allBills.map(b => `
        <tr>
          <td class="fw-bold">#INV-${b.id}</td>
          <td>${b.patientName}</td>
          <td>${b.doctorName}</td>
          <td class="fw-bold text-dark">$${b.totalAmount.toFixed(2)}</td>
          <td><span class="badge-status badge-${b.paymentStatus.toLowerCase()}">${b.paymentStatus}</span></td>
          <td>${b.paymentMethod || 'Pending'}</td>
          <td><small class="text-muted">${b.billingDate}</small></td>
        </tr>
      `).join('');
    }
  },

  renderAdminChart(deptCounts) {
    const canvas = document.getElementById('adminDeptChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const labels = Object.keys(deptCounts);
    const data = Object.values(deptCounts);

    this.chartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['General', 'Cardiology', 'Pediatrics'],
        datasets: [{
          data: data.length ? data : [5, 4, 3],
          backgroundColor: ['#0284c7', '#0d9488', '#6366f1', '#f59e0b', '#ec4899'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Plus Jakarta Sans', weight: '600' },
              padding: 16
            }
          }
        },
        cutout: '68%'
      }
    });
  },

  handleAddDoctor() {
    const name = document.getElementById('addDocName').value;
    const dept = document.getElementById('addDocDept').value;
    const spec = document.getElementById('addDocSpec').value;
    const qual = document.getElementById('addDocQual').value;
    const exp = document.getElementById('addDocExp').value;
    const fee = document.getElementById('addDocFee').value;
    const days = document.getElementById('addDocDays').value;
    const hours = document.getElementById('addDocHours').value;

    const doc = hospitalStore.addDoctor({
      name,
      department: dept,
      specialization: spec,
      qualification: qual,
      experienceYears: exp,
      consultationFee: fee,
      availableDays: days,
      availableHours: hours
    });

    this.showToast(`Doctor ${doc.name} successfully registered in ${doc.department}!`, 'success');
    const modal = bootstrap.Modal.getInstance(document.getElementById('addDoctorModal'));
    if (modal) modal.hide();
    document.getElementById('addDoctorForm').reset();

    this.renderHomeDoctors();
    this.renderDoctorSelectOptions();
    this.renderAdminPortal();
  },

  // ------------------- Prescription Management -------------------
  openIssuePrescriptionModal(appointmentId) {
    const app = hospitalStore.data.appointments.find(a => a.id === Number(appointmentId));
    if (!app) return;

    document.getElementById('issuePrescAppointmentId').value = app.id;
    document.getElementById('issuePrescPatientName').textContent = app.patientName;
    document.getElementById('issuePrescReason').textContent = app.reason;

    const modal = new bootstrap.Modal(document.getElementById('issuePrescriptionModal'));
    modal.show();
  },

  handleIssuePrescription() {
    const appId = document.getElementById('issuePrescAppointmentId').value;
    const diagnosis = document.getElementById('issuePrescDiagnosis').value;
    const medicines = document.getElementById('issuePrescMedicines').value;
    const instructions = document.getElementById('issuePrescInstructions').value;

    if (!diagnosis || !medicines) {
      this.showToast('Please enter diagnosis and prescribed medicines', 'warning');
      return;
    }

    const res = hospitalStore.addPrescription({
      appointmentId: appId,
      diagnosis,
      medicines,
      instructions
    });

    if (res.success) {
      this.showToast('Prescription issued and appointment marked COMPLETED!', 'success');
      const modal = bootstrap.Modal.getInstance(document.getElementById('issuePrescriptionModal'));
      if (modal) modal.hide();
      document.getElementById('issuePrescriptionForm').reset();

      this.renderDoctorPortal();
      this.renderPatientPortal();
      this.renderAdminPortal();
    }
  },

  viewPrescriptionByAppointment(appointmentId) {
    const presc = hospitalStore.getPrescriptionByAppointment(appointmentId);
    if (presc) {
      this.openPrescriptionModal(presc.id);
    } else {
      this.showToast('No prescription recorded for this appointment yet.', 'info');
    }
  },

  openPrescriptionModal(prescriptionId) {
    const p = hospitalStore.data.prescriptions.find(x => x.id === Number(prescriptionId));
    if (!p) return;

    const patient = hospitalStore.getPatientById(p.patientId);

    document.getElementById('rxModalDocName').textContent = p.doctorName;
    document.getElementById('rxModalDocDept').textContent = `${p.department} Specialist`;
    document.getElementById('rxModalDate').textContent = p.dateIssued;
    document.getElementById('rxModalRxNumber').textContent = `#RX-2026-${String(p.id).padStart(4, '0')}`;

    document.getElementById('rxModalPatName').textContent = p.patientName;
    document.getElementById('rxModalPatAge').textContent = patient ? `${patient.gender}, Blood: ${patient.bloodGroup}` : 'Adult Patient';
    document.getElementById('rxModalDiagnosis').textContent = p.diagnosis;
    document.getElementById('rxModalMedicines').textContent = p.medicines;
    document.getElementById('rxModalInstructions').textContent = p.instructions || 'Follow medicine timings diligently.';

    const modal = new bootstrap.Modal(document.getElementById('viewPrescriptionModal'));
    modal.show();
  },

  printPrescription() {
    window.print();
  },

  // ------------------- Billing & Payment -------------------
  openPayBillModal(billId) {
    const bill = hospitalStore.getBillById(billId);
    if (!bill) return;

    document.getElementById('payBillId').value = bill.id;
    document.getElementById('payBillPatientName').textContent = bill.patientName;
    document.getElementById('payBillDoctorName').textContent = bill.doctorName;
    document.getElementById('payBillBreakdown').textContent = bill.breakdown;
    document.getElementById('payBillAmount').textContent = `$${bill.totalAmount.toFixed(2)}`;

    const modal = new bootstrap.Modal(document.getElementById('payBillModal'));
    modal.show();
  },

  confirmPayment() {
    const billId = document.getElementById('payBillId').value;
    const method = document.getElementById('payMethodSelect').value;

    const res = hospitalStore.payBill(billId, method);
    if (res.success) {
      this.showToast(`Payment of $${res.bill.totalAmount.toFixed(2)} received successfully via ${method}!`, 'success');
      const modal = bootstrap.Modal.getInstance(document.getElementById('payBillModal'));
      if (modal) modal.hide();

      this.renderPatientPortal();
      this.renderAdminPortal();
    }
  },

  printInvoice(billId) {
    const bill = hospitalStore.getBillById(billId);
    if (!bill) return;

    alert(`
=========================================
      APEXCARE MULTI-SPECIALTY HOSPITAL
             OFFICIAL RECEIPT
=========================================
Invoice No:    #INV-${bill.id}
Date:          ${bill.billingDate}
Patient:       ${bill.patientName}
Consultant:    ${bill.doctorName}
-----------------------------------------
Services:      ${bill.breakdown}
Consultation:  $${bill.consultationFee.toFixed(2)}
Addl. Charges: $${bill.additionalCharges.toFixed(2)}
-----------------------------------------
TOTAL PAID:    $${bill.totalAmount.toFixed(2)}
Status:        PAID (${bill.paymentMethod})
=========================================
Thank you for choosing ApexCare Hospital!
    `);
  },

  // ------------------- Reset Demo Data -------------------
  resetAllDemoData() {
    if (confirm("Reset all hospital data (Appointments, Bills, Prescriptions) back to default demo state?")) {
      hospitalStore.resetToDefault();
      this.showToast('Database reset to initial demo state.', 'info');
      this.updateUserInterface();
      this.renderHomeDoctors();
      this.renderDoctorSelectOptions();
      this.switchTab('home');
    }
  },

  // ------------------- Toast Notifications -------------------
  showToast(message, type = 'info') {
    const container = document.getElementById('appToastContainer');
    if (!container) return;

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type === 'danger' ? 'danger' : type === 'warning' ? 'warning text-dark' : type === 'success' ? 'success' : 'primary'} border-0 show shadow-lg mb-2`;
    toastEl.setAttribute('role', 'alert');
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body fw-semibold">
          <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'danger' ? 'fa-circle-xmark' : 'fa-bell'} me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;

    container.appendChild(toastEl);
    setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => toastEl.remove(), 400);
    }, 4000);
  }
};
