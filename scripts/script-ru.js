const WEBHOOK_URL = 'https://padalko.app.n8n.cloud/webhook/expres-polish-lead';

const CHAT_URL = 'https://padalko.app.n8n.cloud/webhook/ef75a354-3a90-4862-84ee-c3b708d8446f/chat';

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

function getAnalyticsPageLocation() {
  const pageUrl = new URL(window.location.href);
  pageUrl.search = '';
  pageUrl.hash = '';
  return pageUrl.href;
}

function pushAnalyticsEvent(eventName, parameters = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    page_location: getAnalyticsPageLocation(),
    page_language: document.documentElement.lang,
    ...parameters
  });
}

function getButtonLocation(element) {
  if (element.closest('.social-tab')) return 'social_menu';
  if (element.closest('#mobileNav')) return 'mobile_menu';
  if (element.closest('.header')) return 'header';
  if (element.closest('.footer')) return 'footer';
  if (element.closest('.contact-method, .location__contact')) {
    return 'contact_section';
  }
  return 'content';
}

document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;

  const link = event.target.closest('a[href]');
  if (!(link instanceof HTMLAnchorElement)) return;

  let eventName;
  let contactMethod;
  const linkUrl = new URL(link.href);

  if (linkUrl.protocol === 'tel:') {
    eventName = 'phone_click';
    contactMethod = 'phone';
  } else if (
    linkUrl.hostname === 'wa.me' ||
    linkUrl.hostname === 'whatsapp.com' ||
    linkUrl.hostname.endsWith('.whatsapp.com')
  ) {
    eventName = 'whatsapp_click';
    contactMethod = 'whatsapp';
  } else if (
    linkUrl.hostname === 'raccoon-studio.com.ua' ||
    linkUrl.hostname.endsWith('.raccoon-studio.com.ua')
  ) {
    eventName = 'raccoon_studio_click';
  } else {
    return;
  }

  linkUrl.search = '';
  linkUrl.hash = '';

  const safeLinkUrl =
    contactMethod === 'phone'
      ? 'tel:'
      : contactMethod === 'whatsapp'
        ? `${linkUrl.origin}/`
        : linkUrl.href;

  pushAnalyticsEvent(eventName, {
    button_location: getButtonLocation(link),
    ...(contactMethod ? { contact_method: contactMethod } : {}),
    link_url: safeLinkUrl
  });
});

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
    modalTitle.textContent = `Запись на: ${programName}`;
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
    const programName = button.dataset.program || 'Занятие';
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

function setFormStatus(element, message) {
  if (element) {
    element.textContent = message;
  }
}

function pushFormSubmitEvent(form) {
  pushAnalyticsEvent('form_submit', {
    button_location: form.id === 'modalForm' ? 'program_modal' : 'lead_form'
  });
}

function escapeHTML(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getSessionId() {
  let sessionId = localStorage.getItem('expres_polish_session_id');

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('expres_polish_session_id', sessionId);
  }

  return sessionId;
}

/* LEAD WEBHOOK */

async function sendLeadToWebhook(data) {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(data)
  });

  const rawText = await response.text();

  console.log('Lead n8n status:', response.status);
  console.log('Lead n8n raw response:', rawText);

  if (!response.ok) {
    throw new Error(`Ошибка отправки формы ${response.status}: ${rawText}`);
  }

  if (!rawText) {
    return {
      success: true
    };
  }

  let responseData;
  try {
    responseData = JSON.parse(rawText);
  } catch {
    return {
      success: true,
      reply: rawText
    };
  }

  if (
    responseData &&
    typeof responseData === 'object' &&
    responseData.success === false
  ) {
    throw new Error('Заявка не была принята сервером');
  }

  return responseData;
}

/* MODAL FORM */

if (modalForm) {
  modalForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (modalForm.dataset.submitting === 'true') return;
    modalForm.dataset.submitting = 'true';

    const data = {
      ...getFormData(modalForm),
      source: 'program_modal',
      page: window.location.href,
      createdAt: new Date().toISOString()
    };

    setFormStatus(
      modalFormStatus,
      'Отправляем заявку...'
    );

    try {
      await sendLeadToWebhook(data);
      pushFormSubmitEvent(modalForm);

      setFormStatus(
        modalFormStatus,
        'Спасибо! Мы свяжемся с вами в ближайшее время.'
      );

      modalForm.reset();

      setTimeout(() => {
        closeModal();
      }, 1200);

    } catch (error) {

      setFormStatus(
        modalFormStatus,
        'Ошибка отправки. Попробуйте ещё раз.'
      );

      console.error(error);
    } finally {
      delete modalForm.dataset.submitting;
    }
  });
}

/* MAIN LEAD FORM */

if (leadForm) {
  leadForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (leadForm.dataset.submitting === 'true') return;
    leadForm.dataset.submitting = 'true';

    const data = {
      ...getFormData(leadForm),
      source: 'main_lead_form',
      page: window.location.href,
      createdAt: new Date().toISOString()
    };

    setFormStatus(
      leadFormStatus,
      'Отправляем заявку...'
    );

    try {
      await sendLeadToWebhook(data);
      pushFormSubmitEvent(leadForm);

      setFormStatus(
        leadFormStatus,
        leadForm.dataset.successMessage || 'Спасибо! Мы свяжемся с вами по поводу пробного урока.'
      );

      leadForm.reset();

    } catch (error) {

      setFormStatus(
        leadFormStatus,
        'Ошибка отправки. Попробуйте ещё раз.'
      );

      console.error(error);
    } finally {
      delete leadForm.dataset.submitting;
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
    'Здравствуйте!\n\nМеня зовут Агнешка, я AI-консультант Expres Polish.\n\nС удовольствием отвечу на ваши вопросы, помогу подобрать курс и расскажу, как записаться на пробный урок.\n\nЧтобы я могла лучше сориентироваться, напишите, пожалуйста:\n— ваше имя\n— ваш уровень польского\n— для чего вы хотите изучать язык: жизнь, работа, экзамен или другое'
  );
}

function addMessage(text, type) {
  if (!aiChatMessages) return null;

  const message = document.createElement('div');

  message.className = `ai-message ai-message--${type}`;

  message.innerHTML = escapeHTML(text).replaceAll('\n', '<br>');

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
  return addMessage(
    'Агнешка печатает...',
    'bot ai-message--typing'
  );
}

async function sendMessageToAgent(message) {
  const payload = {
    action: 'sendMessage',
    chatInput: message,
    sessionId: getSessionId()
  };

  const response = await fetch(CHAT_URL, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const rawText = await response.text();

  console.log('Chat n8n status:', response.status);
  console.log('Chat n8n raw response:', rawText);

  if (!response.ok) {
    throw new Error(`Ошибка n8n ${response.status}: ${rawText}`);
  }

  if (!rawText) {
    throw new Error('n8n вернул пустой ответ');
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    return {
      output: rawText
    };
  }
}

function getAgentReply(data) {
  if (typeof data === 'string') {
    return data;
  }

  return (
    data.output ||
    data.reply ||
    data.text ||
    data.message ||
    data.response ||
    'Спасибо! Я передала ваш запрос менеджеру Expres Polish.'
  );
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

    addBotMessage(
      getAgentReply(data)
    );

  } catch (error) {

    if (typingMessage) {
      typingMessage.remove();
    }

    addBotMessage(
      'Извините, сейчас возникла техническая ошибка. Попробуйте ещё раз или оставьте заявку через форму на сайте.'
    );

    console.error(error);
  }
}

chatOpenButtons.forEach(button => {
  button.addEventListener(
    'click',
    openChat
  );
});

chatCloseButtons.forEach(button => {
  button.addEventListener(
    'click',
    closeChat
  );
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

    handleChatMessage(
      aiChatInput.value
    );
  });
}