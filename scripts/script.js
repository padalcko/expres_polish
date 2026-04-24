const WEBHOOK_URL = '';

const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');
const yearSpan = document.getElementById('year');

const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const modalProgram = document.getElementById('modalProgram');
const modalForm = document.getElementById('modalForm');
const modalFormStatus = document.getElementById('modalFormStatus');

const leadForm = document.getElementById('leadForm');
const leadFormStatus = document.getElementById('leadFormStatus');

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

/* MOBILE MENU */

if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('mobile-nav--open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('mobile-nav--open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* FLIP CARDS */

document.querySelectorAll('.card--flip').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});

/* MODAL */

function openModal(programName) {
  if (!modal) return;

  if (modalTitle) {
    modalTitle.textContent = `Запис на: ${programName}`;
  }

  if (modalProgram) {
    modalProgram.value = programName;
  }

  if (modalFormStatus) {
    modalFormStatus.textContent = '';
  }

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal() {
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('.open-modal').forEach(button => {
  button.addEventListener('click', () => {
    const programName = button.dataset.program || 'Заняття';
    openModal(programName);
  });
});

if (modalOverlay) {
  modalOverlay.addEventListener('click', closeModal);
}

if (modalClose) {
  modalClose.addEventListener('click', closeModal);
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

/* HELPERS */

function getFormData(form) {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

async function sendLeadToWebhook(data) {
  if (!WEBHOOK_URL) {
    console.log('Webhook ще не підключений. Дані форми:', data);

    return {
      success: true,
      localMode: true
    };
  }

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Помилка відправки форми');
  }

  return response.json();
}

function setFormStatus(element, message) {
  if (element) {
    element.textContent = message;
  }
}

/* MODAL FORM */

if (modalForm) {
  modalForm.addEventListener('submit', async event => {
    event.preventDefault();

    const data = {
      ...getFormData(modalForm),
      source: 'program_modal',
      page: window.location.href,
      createdAt: new Date().toISOString()
    };

    setFormStatus(modalFormStatus, 'Відправляємо заявку...');

    try {
      await sendLeadToWebhook(data);

      setFormStatus(modalFormStatus, 'Дякуємо! Ми зв’яжемося з вами найближчим часом.');
      modalForm.reset();

      setTimeout(() => {
        closeModal();
      }, 1200);
    } catch (error) {
      setFormStatus(modalFormStatus, 'Помилка відправки. Спробуйте ще раз.');
      console.error(error);
    }
  });
}

/* MAIN LEAD FORM */

if (leadForm) {
  leadForm.addEventListener('submit', async event => {
    event.preventDefault();

    const data = {
      ...getFormData(leadForm),
      source: 'main_lead_form',
      page: window.location.href,
      createdAt: new Date().toISOString()
    };

    setFormStatus(leadFormStatus, 'Відправляємо заявку...');

    try {
      await sendLeadToWebhook(data);

      setFormStatus(leadFormStatus, 'Дякуємо! Ми зв’яжемося з вами щодо пробного уроку.');
      leadForm.reset();
    } catch (error) {
      setFormStatus(leadFormStatus, 'Помилка відправки. Спробуйте ще раз.');
      console.error(error);
    }
  });
}