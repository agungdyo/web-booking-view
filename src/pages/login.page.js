/**
 * Login Page
 */
import { authService } from '../services/auth.service.js';
import { validateEmail, validatePassword } from '../utils/validation.js';
import Toast from '../components/toast.component.js';

export async function renderLoginPage({ query }) {
  const content = document.getElementById('page-content');
  const redirect = query.redirect || '/';

  // If already logged in, redirect
  if (authService.isLoggedIn()) {
    window.location.href = redirect;
    return;
  }

  content.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <h1 class="auth-title">Masuk</h1>
        <p class="auth-subtitle">Masuk untuk melihat dan mengelola booking Anda</p>

        <form id="login-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="email" placeholder="nama@email.com" required>
            <p class="form-error" id="email-error"></p>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="password" placeholder="Masukkan password" required>
            <p class="form-error" id="password-error"></p>
          </div>

          <div id="login-error" class="alert alert-error" style="display: none;"></div>

          <button type="submit" class="btn btn-primary btn-lg btn-block" id="submit-btn">
            Masuk
          </button>
        </form>

        <div class="auth-footer">
          Belum punya akun? <a href="/register">Daftar di sini</a>
        </div>
      </div>
    </div>
  `;

  // Setup form handler
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleLogin(redirect);
  });
}

async function handleLogin(redirect) {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  const submitBtn = document.getElementById('submit-btn');

  // Clear previous errors
  errorDiv.style.display = 'none';
  document.getElementById('email-error').textContent = '';
  document.getElementById('password-error').textContent = '';

  // Validate
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    document.getElementById('email-error').textContent = emailValidation.message;
    return;
  }

  if (!password) {
    document.getElementById('password-error').textContent = 'Password wajib diisi';
    return;
  }

  // Submit
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div>';

  try {
    const response = await authService.login(email, password);

    if (response.success) {
      Toast.success('Login berhasil!');
      window.location.href = redirect;
    } else {
      throw new Error(response.error?.message || 'Login gagal');
    }
  } catch (error) {
    console.error('Login error:', error);
    errorDiv.textContent = error.message;
    errorDiv.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Masuk';
  }
}

export default renderLoginPage;
