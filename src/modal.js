document.addEventListener('click', function (e) {
    // Open modal
    const openBtn = e.target.closest('[data-modal-open]');
    if (openBtn) {
      const modalId = openBtn.getAttribute('data-modal-open');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
      }
      return;
    }
  
    // Close modal (x, escape o clic fuera)
    const closeTrigger = e.target.closest('.modal-close, .modal-backdrop');
    if (closeTrigger) {
      const modal = closeTrigger.closest('.modal');
      if (modal) {
        modal.setAttribute('hidden', '');
        document.body.style.overflow = '';
      }
    }
  });
  
  // Close con escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.modal:not([hidden])');
      if (openModal) {
        openModal.setAttribute('hidden', '');
        document.body.style.overflow = '';
      }
    }
  });