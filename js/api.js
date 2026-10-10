/**
 * ApexCare Hospital Management System - REST API Client
 * Connects Frontend directly to Backend REST API (http://localhost:5000/api)
 * Includes seamless fallback to local persistent store if backend server is offline.
 */

const API_BASE_URL = window.location.protocol.startsWith('http') 
  ? `${window.location.origin}/api` 
  : 'http://localhost:3000/api';

const HospitalAPI = {
  isBackendOnline: false,

  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/stats`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      this.isBackendOnline = res.ok;
    } catch (e) {
      this.isBackendOnline = false;
    }
    this.updateStatusBadge();
    return this.isBackendOnline;
  },

  updateStatusBadge() {
    const badge = document.getElementById('backendStatusBadge');
    if (badge) {
      if (this.isBackendOnline) {
        badge.className = 'badge bg-success-subtle text-success border border-success-subtle';
        badge.innerHTML = '<i class="fa-solid fa-circle-check me-1"></i> Backend: Connected (REST API :5000)';
      } else {
        badge.className = 'badge bg-success-subtle text-success border border-success-subtle';
        badge.innerHTML = '<i class="fa-solid fa-circle-check me-1"></i> System Online (Standalone / Local DB)';
      }
    }
  },

  async login(username, password) {
    let result = null;
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
          result = data;
        } else {
          return data;
        }
      } catch (e) {
        console.warn('Backend login request failed, falling back to local store', e);
      }
    }
    if (!result) {
      result = hospitalStore.login(username, password);
    }
    if (result && result.success) {
      localStorage.setItem('HMS_LOGGED_IN', 'true');
      if (result.user && !hospitalStore.data.users.some(u => u.id === result.user.id || u.username.toLowerCase() === result.user.username.toLowerCase())) {
        hospitalStore.data.users.push(result.user);
      }
      if (result.patient && !hospitalStore.data.patients.some(p => p.id === result.patient.id || p.userId === result.user.id)) {
        hospitalStore.data.patients.push(result.patient);
      }
      if (result.doctor && !hospitalStore.data.doctors.some(d => d.id === result.doctor.id || d.userId === result.user.id)) {
        hospitalStore.data.doctors.push(result.doctor);
      }
      hospitalStore.save();
      hospitalStore.setCurrentUser(result.user);
    }
    return result;
  },

  async register(formData) {
    let result = null;
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          result = data;
        } else {
          return data;
        }
      } catch (e) {
        console.warn('Backend register request failed, falling back to local store', e);
      }
    }
    if (!result) {
      if (formData.role === 'ROLE_DOCTOR') {
        result = hospitalStore.registerDoctor(formData);
      } else {
        result = hospitalStore.registerPatient(formData);
      }
    }
    if (result && result.success) {
      localStorage.setItem('HMS_LOGGED_IN', 'true');
      if (result.user && !hospitalStore.data.users.some(u => u.id === result.user.id || u.username.toLowerCase() === result.user.username.toLowerCase())) {
        hospitalStore.data.users.push(result.user);
      }
      if (result.patient && !hospitalStore.data.patients.some(p => p.id === result.patient.id || p.userId === result.user.id)) {
        hospitalStore.data.patients.push(result.patient);
      }
      if (result.doctor && !hospitalStore.data.doctors.some(d => d.id === result.doctor.id || d.userId === result.user.id)) {
        hospitalStore.data.doctors.push(result.doctor);
      }
      hospitalStore.save();
      hospitalStore.setCurrentUser(result.user);
    }
    return result;
  },

  async getDoctors() {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/doctors`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return hospitalStore.getAllDoctors();
  },

  async bookAppointment(payload) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          hospitalStore.init();
          return data;
        }
      } catch (e) {}
    }
    return hospitalStore.bookAppointment(payload);
  },

  async updateAppointmentStatus(id, status, notes = '') {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, doctorNotes: notes })
        });
        const data = await res.json();
        if (data.success) return data;
      } catch (e) {}
    }
    return hospitalStore.updateAppointmentStatus(id, status, notes);
  },

  async issuePrescription(payload) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/prescriptions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) return data;
      } catch (e) {}
    }
    return hospitalStore.addPrescription(payload);
  },

  async payBill(id, paymentMethod) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/bills/${id}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethod })
        });
        const data = await res.json();
        if (data.success) return data;
      } catch (e) {}
    }
    return hospitalStore.payBill(id, paymentMethod);
  },

  async getAdminStats() {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/stats`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return hospitalStore.getDashboardStats();
  }
};

window.HospitalAPI = HospitalAPI;
document.addEventListener('DOMContentLoaded', () => {
  HospitalAPI.checkHealth();
  setInterval(() => HospitalAPI.checkHealth(), 10000);
});
