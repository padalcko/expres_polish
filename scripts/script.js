const WEBHOOK_URL = 'https://padalko.app.n8n.cloud/webhook/expres-polish-lead';
const CHAT_WEBHOOK_URL = 'https://padalko.app.n8n.cloud/webhook/expres-polish-chat';

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

const aiChat = document.getElementById('aiChat');
const aiChatMessages = document.getElementById('aiChatMessages');
const aiChatForm = document.getElementById('aiChatForm');
const aiChatInput = document.getElementById('aiChatInput');
const chatOpenButtons = document.querySelectorAll('.js-chat-open');
const chatCloseButtons = document.querySelectorAll('.js-chat-close');
const quickChatButtons = document.querySelectorAll('[data-chat-message]');

let chatStarted = false;
let chatHistory = [];

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

/* MOBILE MENU */

if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('mobile-nav--open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  mobileNav.querySelectorAll('a, button').forEach(link => {
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
    closeChat();
  }
});

/* HELPERS */

function getFormData(form) {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

async function sendLeadToWebhook(data) {
  if (!WEBHOOK_URL) {
    console.log('Webhook форми ще не підключений. Дані форми:', data);

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

function escapeHTML(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
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

/* AI CONSULTANT CHAT */

function openChat() {
  if (!aiChat) return;

  aiChat.classList.add('ai-chat--open');
  aiChat.setAttribute('aria-hidden', 'false');
  document.body.classList.add('chat-open');

  startChat();

  setTimeout(() => {
    if (aiChatInput) {
      aiChatInput.focus();
    }
  }, 150);
}

function closeChat() {
  if (!aiChat) return;

  aiChat.classList.remove('ai-chat--open');
  aiChat.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('chat-open');
}

function startChat() {
  if (chatStarted) return;

  chatStarted = true;

  addBotMessage(
    'Привіт 👋\n\nМене звати Агнешка, я AI-консультант Expres Polish.\n\nЗ радістю відповім на ваші питання, допоможу підібрати курс і підкажу, як записатися на пробний урок.\n\nЩоб я краще зорієнтувалася, напишіть, будь ласка:\n— ваше ім’я\n— ваш рівень польської\n— для чого хочете вивчати мову: життя, робота, іспит чи інше'
  );
}

function addMessage(text, type) {
  if (!aiChatMessages) return;

  const message = document.createElement('div');
  message.className = `ai-message ai-message--${type}`;
  message.innerHTML = escapeHTML(text);

  aiChatMessages.appendChild(message);
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

  return message;
}

function addBotMessage(text) {
  chatHistory.push({
    role: 'assistant',
    content: text
  });

  return addMessage(text, 'bot');
}

function addUserMessage(text) {
  chatHistory.push({
    role: 'user',
    content: text
  });

  return addMessage(text, 'user');
}

function showTyping() {
  return addMessage('Агнешка друкує...', 'bot ai-message--typing');
}

function getLocalDemoReply(message) {
  const text = message.toLowerCase();

  if (text.includes('ціна') || text.includes('ціни') || text.includes('скільки')) {
    return 'У нас є кілька форматів навчання:\n\n— групові заняття: від 499 zł / місяць\n— індивідуальні заняття: від 89 zł / урок\n— парні заняття: від 69 zł / людина\n\nЩоб точніше підібрати формат, напишіть ваш рівень польської та ціль навчання.';
  }

  if (text.includes('проб') || text.includes('урок') || text.includes('запис')) {
    return 'Так, перший пробний урок безкоштовний. На ньому ми знайомимося, визначаємо ваш рівень і підбираємо формат навчання.\n\nНапишіть, будь ласка, ваше ім’я та контакт для зв’язку.';
  }

  if (text.includes('курс') || text.includes('підібрати') || text.includes('рівень')) {
    return 'Я допоможу підібрати курс. Напишіть, будь ласка:\n\n— ваш рівень польської: A0, A1, A2, B1, B2 або “не знаю”\n— ваша ціль: життя в Польщі, робота, іспит або інше\n— який формат зручніший: група, індивідуально чи парно.';
  }

  if (text.includes('онлайн') || text.includes('офлайн') || text.includes('вроцлав')) {
    return 'Навчання можливе онлайн, а також офлайн у Вроцлаві. Формат підбираємо залежно від вашої цілі, рівня та графіка.';
  }

  return 'Дякую, я зрозуміла ваш запит. Щоб краще підібрати курс, напишіть, будь ласка, ваш рівень польської, ціль навчання та зручний формат: група, індивідуально або парно.';
}

async function sendMessageToAgent(message) {
  if (!CHAT_WEBHOOK_URL) {
    console.log('Chat webhook ще не підключений. Повідомлення:', {
      message,
      history: chatHistory,
      page: window.location.href
    });

    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          reply: getLocalDemoReply(message),
          localMode: true
        });
      }, 700);
    });
  }

  const response = await fetch(CHAT_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      history: chatHistory,
      page: window.location.href,
      source: 'ai_chat',
      createdAt: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error('Помилка відповіді AI-консультанта');
  }

  return response.json();
}

async function handleChatMessage(message) {
  const cleanMessage = message.trim();

  if (!cleanMessage) return;

  addUserMessage(cleanMessage);

  if (aiChatInput) {
    aiChatInput.value = '';
  }

  const typingMessage = showTyping();

  try {
    const data = await sendMessageToAgent(cleanMessage);

    if (typingMessage) {
      typingMessage.remove();
    }

    addBotMessage(data.reply || 'Дякую! Я передала ваш запит менеджеру Expres Polish.');
  } catch (error) {
    if (typingMessage) {
      typingMessage.remove();
    }

    addBotMessage('Вибачте, зараз виникла технічна помилка. Спробуйте ще раз або залиште заявку через форму на сайті.');
    console.error(error);
  }
}

chatOpenButtons.forEach(button => {
  button.addEventListener('click', openChat);
});

chatCloseButtons.forEach(button => {
  button.addEventListener('click', closeChat);
});

quickChatButtons.forEach(button => {
  button.addEventListener('click', () => {
    const message = button.dataset.chatMessage;

    openChat();

    if (message) {
      handleChatMessage(message);
    }
  });
});

if (aiChatForm) {
  aiChatForm.addEventListener('submit', event => {
    event.preventDefault();

    if (!aiChatInput) return;

    handleChatMessage(aiChatInput.value);
  });
}