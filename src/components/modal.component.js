/**
 * Modal Component
 */

class Modal {
  static show(content, options = {}) {
    const container = document.getElementById('modal-container');
    if (!container) return;

    const { title = '', size = 'md', onClose = null } = options;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal" style="max-width: ${size === 'sm' ? '400px' : size === 'lg' ? '700px' : '500px'}">
        ${title ? `
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        ` : ''}
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;

    container.appendChild(backdrop);

    // Trigger animation
    requestAnimationFrame(() => {
      backdrop.classList.add('open');
      backdrop.querySelector('.modal').classList.add('open');
    });

    // Close handlers
    const close = () => {
      backdrop.classList.remove('open');
      backdrop.querySelector('.modal').classList.remove('open');
      setTimeout(() => {
        backdrop.remove();
        if (onClose) onClose();
      }, 250);
    };

    backdrop.querySelector('.modal-close')?.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });

    // ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    return { close };
  }

  static hide() {
    const backdrop = document.querySelector('.modal-backdrop.open');
    if (backdrop) {
      backdrop.classList.remove('open');
      backdrop.querySelector('.modal')?.classList.remove('open');
      setTimeout(() => {
        backdrop.remove();
      }, 250);
    }
  }

  static confirm(message, onConfirm, options = {}) {
    const { title = 'Konfirmasi', confirmText = 'Ya', cancelText = 'Batal', type = 'warning' } = options;

    const iconSvg = type === 'danger'
      ? `<div style="width: 60px; height: 60px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-lg);">
           <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
         </div>`
      : `<div style="width: 60px; height: 60px; background: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-lg);">
           <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
         </div>`;

    const content = `
      ${iconSvg}
      <p style="text-align: center; color: var(--text-secondary);">${message}</p>
      <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-xl);">
        <button class="btn btn-secondary btn-block" id="modal-cancel">${cancelText}</button>
        <button class="btn ${type === 'danger' ? 'btn-error' : 'btn-primary'} btn-block" id="modal-confirm">${confirmText}</button>
      </div>
    `;

    const modal = this.show(content, { title });

    document.getElementById('modal-cancel')?.addEventListener('click', () => {
      this.hide();
    });

    document.getElementById('modal-confirm')?.addEventListener('click', () => {
      this.hide();
      if (onConfirm) onConfirm();
    });
  }
}

export default Modal;
