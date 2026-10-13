import { createIcons, Sprout, Menu, X, ArrowUpRight, ArrowRight, ArrowDown, ArrowUp, ClipboardList, ShieldCheck, UsersRound, HeartHandshake, Network, Mail, Linkedin, Copy } from 'lucide';
import { createInquiry, createMailto } from './inquiry.js';
import './style.css';

const icons = { Sprout, Menu, X, ArrowUpRight, ArrowRight, ArrowDown, ArrowUp, ClipboardList, ShieldCheck, UsersRound, HeartHandshake, Network, Mail, Linkedin, Copy };
const renderIcons = () => createIcons({ icons, attrs: { 'stroke-width': 1.7 } });
renderIcons();

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');

function setMenu(isOpen) {
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  menuToggle.title = isOpen ? 'Close navigation' : 'Open navigation';
  menuToggle.innerHTML = `<i data-lucide="${isOpen ? 'x' : 'menu'}" aria-hidden="true"></i>`;
  nav.classList.toggle('is-open', isOpen);
  renderIcons();
}

menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuToggle.focus();
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
  if (event.matches) setMenu(false);
});

const form = document.querySelector('#inquiry-form');
const inquiryDialog = document.querySelector('#inquiry-dialog');
const draft = document.querySelector('#inquiry-draft');
const copyStatus = document.querySelector('#copy-status');
let contactEmail = '';

document.querySelectorAll('[data-service]').forEach((link) => {
  link.addEventListener('click', () => {
    form.elements.service.value = link.dataset.service;
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  for (const field of [form.elements.name, form.elements.message]) {
    field.setCustomValidity(field.value.trim() ? '' : 'Please enter a value, not only spaces.');
    if (!field.reportValidity()) return;
  }

  const inquiry = createInquiry(Object.fromEntries(new FormData(form)));
  draft.value = inquiry.body;
  copyStatus.textContent = '';
  const emailLink = document.querySelector('#email-draft');
  emailLink.hidden = !contactEmail;
  if (contactEmail) {
    emailLink.href = createMailto(contactEmail, inquiry);
    document.querySelector('#delivery-status').textContent = 'Your draft is ready. No message has been sent.';
  } else {
    document.querySelector('#delivery-status').textContent = "A contact email hasn't been added yet. Your message has not been sent.";
  }
  inquiryDialog.showModal();
});

for (const field of [form.elements.name, form.elements.message]) {
  field.addEventListener('input', () => field.setCustomValidity(''));
}

document.querySelector('#copy-inquiry').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(draft.value);
    copyStatus.textContent = 'Inquiry copied. Your message has not been sent.';
  } catch {
    draft.focus();
    draft.select();
    copyStatus.textContent = 'Clipboard access is unavailable. Your draft is selected for copying.';
  }
});

document.querySelector('#privacy-button').addEventListener('click', () => document.querySelector('#privacy-dialog').showModal());
document.querySelectorAll('[data-close-dialog]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog').close());
});
document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
});

async function loadContact() {
  if (import.meta.env.DEV) return;
  try {
    const response = await fetch('/api/config');
    if (!response.ok) return;
    const config = await response.json();
    if (typeof config.contactEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)) return;
    contactEmail = config.contactEmail;
    const placeholder = document.querySelector('#contact-email');
    const emailAnchor = document.createElement('a');
    emailAnchor.href = `mailto:${encodeURIComponent(contactEmail)}`;
    const icon = document.createElement('i');
    icon.dataset.lucide = 'mail';
    icon.setAttribute('aria-hidden', 'true');
    emailAnchor.append(icon, document.createTextNode(contactEmail));
    placeholder.replaceWith(emailAnchor);
    renderIcons();
  } catch {
    contactEmail = '';
  }
}

loadContact();
document.querySelector('#year').textContent = new Date().getFullYear();