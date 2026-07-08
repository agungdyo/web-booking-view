/**
 * Register Page
 */
import { authService } from '../services/auth.service.js';
import { ValidationRules, validateForm } from '../utils/validation.js';
import Toast from '../components/toast.component.js';

export async function renderRegisterPage() {
  const content = document.getElementById('page-content');

  // If already logged in, redirect
  if (authService.isLoggedIn()) {
    window.location.href = '/dashboard';
    return;
  }

  content.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <h1 class="auth-title">Daftar Akun</h1>
        <p class="auth-subtitle">Buat akun baru untuk mulai booking</p>

        <form id="register-form">
          <div class="form-group">
            <label class="form-label">Nama Lengkap</label>
            <input type="text" class="form-input" id="name" placeholder="Masukkan nama lengkap" required>
            <p class="form-error" id="name-error"></p>
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="email" placeholder="nama@email.com" required>
            <p class="form-error" id="email-error"></p>
          </div>

          <div class="form-group">
            <label class="form-label">Nomor Telepon</label>
            <input type="tel" class="form-input" id="phone" placeholder="08xxxxxxxxxx" required>
            <p class="form-hint">Contoh: 081234567890</p>
            <p class="form-error" id="phone-error"></p>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="password" placeholder="Minimal 6 karakter" required>
            <p class="form-error" id="password-error"></p>
          </div>

          <div class="form-group">
            <label class="form-label">Konfirmasi Password</label>
            <input type="password" class="form-input" id="password_confirm" placeholder="Ulangi password" required>
            <p class="form-error" id="password_confirm-error"></p>
          </div>

          <div id="register-error" class="alert alert-error" style="display: none;"></div>

          <button type="submit" class="btn btn-primary btn-lg btn-block" id="submit-btn">
            Daftar
          </button>
        </form>

        <div class="auth-footer">
          Sudah punya akun? <a href="/login">Masuk di sini</a>
        </div>
      </div>
    </div>
  `;

  // Setup form handler
  const form = document.getElementById('register-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleRegister();
  });
}

async function handleRegister() {
  const formData = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    password: document.getElementById('password').value,
    password_confirm: document.getElementById('password_confirm').value,
  };

  // Clear errors
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.getElementById('register-error').style.display = 'none';

  // Validate
  const rules = {
    name: ValidationRules.name,
    email: ValidationRules.email,
    phone: ValidationRules.phone,
    password: ValidationRules.password,
    password_confirm: [(v) => {
      if (v !== formData.password) {
        return { valid: false, message: 'Konfirmasi password tidak cocok' };
      }
      return { valid: true };
    }],
  };

  const validation = validateForm(formData, rules);

  if (!validation.valid) {
    const firstError = Object.keys(validation.errors)[0];
    document.getElementById(`${firstError}-error`).textContent = validation.errors[firstError];
    return;
  }

  // Submit
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div>';

  try {
    const response = await authService.register(formData);

    if (response.success) {
      Toast.success('Registrasi berhasil! Selamat datang!');
      window.location.href = '/dashboard';
    } else {
      throw new Error(response.error?.message || 'Registrasi gagal');
    }
  } catch (error) {
    console.error('Register error:', error);
    document.getElementById('register-error').textContent = error.message;
    document.getElementById('register-error').style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Daftar';
  }
}

export default renderRegisterPage;
